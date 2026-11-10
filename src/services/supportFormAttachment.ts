import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  SUPPORT_FORM_ATTACHMENT_JPEG_QUALITY,
  SUPPORT_FORM_ATTACHMENT_MAX_BYTES,
  SUPPORT_FORM_ATTACHMENT_MAX_COUNT,
  SUPPORT_FORM_ATTACHMENT_MAX_DIMENSION,
  estimateBase64DecodedBytes,
  sanitizeSupportFormAttachmentFilename,
  validateSupportFormAttachmentPayload,
  type SupportFormAttachmentDraft,
} from '../utils/supportFormAttachment';

export type PickSupportFormAttachmentsResult =
  | { ok: true; attachments: SupportFormAttachmentDraft[] }
  | { ok: false; cancelled?: boolean; error: string };

function extensionForUri(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(uri);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

function buildFilename(uri: string, index: number): string {
  const ext = extensionForUri(uri) === 'png' ? 'png' : 'jpg';
  const suffix = index > 0 ? `-${index + 1}` : '';
  return sanitizeSupportFormAttachmentFilename(`screenshot${suffix}.${ext}`);
}

async function compressAttachmentUri(
  uri: string,
  width?: number,
  height?: number,
): Promise<string> {
  const longestSide = Math.max(width ?? 0, height ?? 0);
  const actions =
    longestSide > SUPPORT_FORM_ATTACHMENT_MAX_DIMENSION
      ? [
          {
            resize:
              (width ?? 0) >= (height ?? 0)
                ? { width: SUPPORT_FORM_ATTACHMENT_MAX_DIMENSION }
                : { height: SUPPORT_FORM_ATTACHMENT_MAX_DIMENSION },
          },
        ]
      : [];

  const manipulated = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: SUPPORT_FORM_ATTACHMENT_JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return manipulated.uri;
}

async function draftFromAsset(
  asset: ImagePicker.ImagePickerAsset,
  index: number,
): Promise<SupportFormAttachmentDraft | null> {
  const compressedUri = await compressAttachmentUri(asset.uri, asset.width, asset.height);
  const contentBase64 = await FileSystem.readAsStringAsync(compressedUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (estimateBase64DecodedBytes(contentBase64) > SUPPORT_FORM_ATTACHMENT_MAX_BYTES) {
    return null;
  }

  const attachment: SupportFormAttachmentDraft = {
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    previewUri: compressedUri,
    filename: buildFilename(compressedUri, index),
    contentType: 'image/jpeg',
    contentBase64,
  };

  if (validateSupportFormAttachmentPayload(attachment)) {
    return null;
  }

  return attachment;
}

export async function pickSupportFormAttachments(
  remainingSlots: number,
): Promise<PickSupportFormAttachmentsResult> {
  const slots = Math.min(
    Math.max(0, remainingSlots),
    SUPPORT_FORM_ATTACHMENT_MAX_COUNT,
  );
  if (slots <= 0) {
    return {
      ok: false,
      error: `אפשר לצרף עד ${SUPPORT_FORM_ATTACHMENT_MAX_COUNT} תמונות.`,
    };
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      error: 'אין הרשאה לגלריה. אפשר לאשר גישה לתמונות בהגדרות המכשיר.',
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: slots,
    quality: 1,
    exif: false,
  });

  if (result.canceled || !result.assets?.length) {
    return { ok: false, cancelled: true, error: '' };
  }

  try {
    const selected = result.assets.slice(0, slots);
    const drafts: SupportFormAttachmentDraft[] = [];
    let skippedOversized = 0;

    for (let index = 0; index < selected.length; index += 1) {
      const draft = await draftFromAsset(selected[index], index);
      if (draft) {
        drafts.push(draft);
      } else {
        skippedOversized += 1;
      }
    }

    if (drafts.length === 0) {
      return {
        ok: false,
        error:
          skippedOversized > 0
            ? 'התמונות גדולות מדי גם אחרי דחיסה. נסו תמונות קטנות יותר.'
            : 'לא הצלחנו לטעון את התמונות. נסו שוב.',
      };
    }

    return { ok: true, attachments: drafts };
  } catch {
    return {
      ok: false,
      error: 'לא הצלחנו לטעון את התמונות. נסו שוב.',
    };
  }
}
