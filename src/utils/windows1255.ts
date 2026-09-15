const WINDOWS_1255_TABLE = "\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\b\t\n\u000b\f\r\u000e\u000f\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~€‚ƒ„…†‡ˆ‰‹‘’“”•–—˜™› ¡¢£₪¥¦§¨©×«¬­®¯°±²³´µ¶·¸¹÷»¼½¾¿ְֱֲֳִֵֶַָֹֺֻּֽ־ֿ׀ׁׂ׃װױײ׳״�������אבגדהוזחטיךכלםמןנסעףפץצקרשת��‎‏�";

export function decodeWindows1255(bytes: Uint8Array): string {
  const parts: string[] = [];
  const chunkSize = 4096;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, bytes.length);
    let chunk = '';
    for (let i = offset; i < end; i += 1) {
      chunk += WINDOWS_1255_TABLE.charAt(bytes[i]);
    }
    parts.push(chunk);
  }
  return parts.join('');
}

export function decodeHtmlBytes(bytes: Uint8Array): string {
  try {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('windows-1255').decode(bytes);
    }
  } catch {
  }
  return decodeWindows1255(bytes);
}
