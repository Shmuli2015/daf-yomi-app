export interface MilestoneInfo {
  badge: string;
  title: string;
  quote: string;
}

export interface UpcomingCopyInfo {
  badge: string;
  headline: string;
  callToAction: string;
}

export function getStreakMilestone(streak: number): MilestoneInfo {
  if (streak >= 365) {
    return {
      badge: 'שנה תמימה של דף יומי',
      title: 'שנה שלמה של מסע מופלא',
      quote: 'עֵץ חַיִּים הִיא לַמַּחֲזִיקִים בָּהּ',
    };
  }
  if (streak >= 100) {
    return {
      badge: 'מאה ימי עיון',
      title: 'התמדה ראויה לשבח',
      quote: 'אֵינוֹ דּוֹמֶה שׁוֹנֶה פִּרְקוֹ מֵאָה פְּעָמִים',
    };
  }
  if (streak >= 50) {
    return {
      badge: 'יובל ימי לימוד',
      title: 'חמישים ימים של עוצמה',
      quote: 'וְהָגִיתָ בּוֹ יוֹמָם וָלַיְלָה',
    };
  }
  if (streak >= 30) {
    return {
      badge: 'חודש רצוף בתורה',
      title: 'חודש שלם של מסירות',
      quote: 'אַשְׁרֵי מִי שֶׁעֲמָלוֹ בַּתּוֹרָה',
    };
  }
  if (streak >= 14) {
    return {
      badge: 'שבועיים של רצף',
      title: 'התמדה מנצחת',
      quote: 'קָבַעְתָּ עִתִּים לַתּוֹרָה',
    };
  }
  if (streak >= 7) {
    return {
      badge: 'שבוע של התמדה',
      title: 'שבוע שלם ללא הפסקה',
      quote: 'יוֹם לְיוֹם יַבִּיעַ אֹמֶר',
    };
  }
  return {
    badge: 'תחילת הדרך',
    title: 'רצף לימוד יומי',
    quote: 'כָּל הַהַתְחָלוֹת קָשׁוֹת, עַד שֶׁנַּעֲשִׂים לְהֶרְגֵּל',
  };
}

export function getShasMilestone(percentage: number): MilestoneInfo {
  if (percentage >= 100) {
    return {
      badge: 'סיום הש״ס כולו',
      title: 'הדרן עלך כל הש״ס',
      quote: 'הֲדְרָן עֲלָךְ תַּלְמוּד בַּבְלִי וַהֲדָרָךְ עֲלַן',
    };
  }
  if (percentage >= 75) {
    return {
      badge: 'בדרך לסיום הש״ס',
      title: 'הישורת האחרונה של הש״ס',
      quote: 'כָּל מַאן דְּטָרַח מִקַּמֵּי שַׁבְּתָא יֵיכַל בְּשַׁבְּתָא',
    };
  }
  if (percentage >= 50) {
    return {
      badge: 'חצי ש״ס בידיי',
      title: 'מחצית הש״ס מאחוריי',
      quote: 'שִׂמְחוּ בַּה׳ וְגִילוּ צַדִּיקִים',
    };
  }
  if (percentage >= 25) {
    return {
      badge: 'רבע ש״ס הושלם',
      title: 'רבע ש״ס בידיי',
      quote: 'אֵין הַתּוֹרָה נִקְנֵית אֶלָּא בַּחֲבוּרָה',
    };
  }
  if (percentage >= 10) {
    return {
      badge: 'עשירית הש״ס',
      title: 'הישג משמעותי בש״ס',
      quote: 'יְגַעְתָּ וּמָצָאתָ תַּאֲמִין',
    };
  }
  return {
    badge: 'פסיעות ראשונות',
    title: 'בדרך לקניין הש״ס',
    quote: 'לֹא עָלֶיךָ הַמְּלָאכָה לִגְמוֹר, וְלֹא אַתָּה בֶן חוֹרִין לִבָּטֵל מִמֶּנָּה',
  };
}

export function getUpcomingMasechetCopy(
  masechetHe: string,
  daysLeft: number,
  status?: 'upcoming' | 'starting_today' | 'just_started',
): UpcomingCopyInfo {
  if (status === 'just_started') {
    return {
      badge: 'התחלנו מסכת חדשה!',
      headline: `התחלנו מסכת ${masechetHe}!`,
      callToAction: 'התחלנו את המסכת וזה הזמן המושלם להצטרף ללימוד הדף היומי',
    };
  }
  if (daysLeft === 0 || status === 'starting_today') {
    return {
      badge: 'היום מתחילים!',
      headline: `היום מתחילים מסכת ${masechetHe}!`,
      callToAction: 'הצטרפו עוד היום ללימוד הדף היומי',
    };
  }
  if (daysLeft === 1) {
    return {
      badge: 'מחר מתחילים!',
      headline: `מחר מתחילים מסכת ${masechetHe}!`,
      callToAction: 'ההזדמנות שלך להתחיל מסכת מהדף הראשון',
    };
  }
  return {
    badge: `עוד ${daysLeft} ימים מתחילים`,
    headline: `מתחילים מסכת ${masechetHe}!`,
    callToAction: 'מתארגנים עכשיו ומתחילים יחד מהדף הראשון',
  };
}
