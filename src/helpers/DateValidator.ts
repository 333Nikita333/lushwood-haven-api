export class DateValidator {
  private static dateRegexp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

  public static validateDateFormat(dateStr: string): void {
    if (!this.dateRegexp.test(dateStr)) {
      throw new Error(
        `${dateStr} is not a valid date format. Date format must be 'YYYY-MM-DD HH:MM'`
      );
    }
  }
  public static validateDateNotInPast(dateStr: string): void {
    const date = new Date(dateStr);
    const now = new Date();

    if (date < now) {
      throw new Error(`${dateStr} is in the past. Dates must be in the future`);
    }
  }

  public static validateCheckInBeforeCheckOut(
    dateCheckIn: string,
    dateCheckOut: string
  ): void {
    const checkInDate = new Date(dateCheckIn);
    const checkOutDate = new Date(dateCheckOut);

    if (checkInDate > checkOutDate) {
      throw new Error("Date check in must be before date check out");
    }
  }
}
