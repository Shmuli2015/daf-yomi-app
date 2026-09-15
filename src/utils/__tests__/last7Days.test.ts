import { buildLast7Days } from "../last7Days";

describe("buildLast7Days", () => {
  const today = new Date(2026, 8, 16);

  it("anchors the window to today, not a selected past date", () => {
    const days = buildLast7Days([], today);

    expect(days).toHaveLength(7);
    expect(days[0].dateStr).toBe("2026-09-10");
    expect(days[6].dateStr).toBe("2026-09-16");
    expect(days.filter((day) => day.isToday)).toHaveLength(1);
    expect(days[6].isToday).toBe(true);
    expect(days[5].isToday).toBe(false);
  });

  it("maps history status onto the today-anchored window", () => {
    const days = buildLast7Days(
      [
        { date: "2026-09-10", status: "learned" },
        { date: "2026-09-15", status: "partial" },
        { date: "2026-09-09", status: "learned" },
      ],
      today,
    );

    expect(days[0].status).toBe("learned");
    expect(days[5].status).toBe("partial");
    expect(days[6].status).toBe("missed");
  });
});
