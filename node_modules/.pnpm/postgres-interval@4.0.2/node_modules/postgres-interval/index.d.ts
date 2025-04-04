declare namespace PostgresInterval {
  export interface IPostgresInterval {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;

    /**
     * Returns an interval string. This allows the interval object to be passed into prepared statements.
     *
     * ```js
     * var parse = require('postgres-interval')
     * var interval = parse('01:02:03')
     * // => { hours: 1, minutes: 2, seconds: 3 }
     * interval.toPostgres()
     * // 1 hour 2 minutes 3 seconds
     * ```
     */
    toPostgres(): string;

    /**
     * Returns an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) compliant string, for example P0Y0M0DT0H9M0S.
     *
     * Also available as {@link toISOString toISOString}.
     *
     * ```js
     * var parse = require('postgres-interval')
     * var interval = parse('01:02:03')
     * // => { hours: 1, minutes: 2, seconds: 3 }
     * interval.toISO()
     * // P0Y0M0DT1H2M3S
     * ```
     */
    toISO(): string;
    /**
     * Returns an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) compliant string, for example P0Y0M0DT0H9M0S.
     *
     * Also available as {@link toISO toISO} for backwards compatibility.
     *
     * ```js
     * var parse = require('postgres-interval')
     * var interval = parse('01:02:03')
     * // => { hours: 1, minutes: 2, seconds: 3 }
     * interval.toISOString()
     * // P0Y0M0DT1H2M3S
     * ```
     */
    toISOString(): string;
    /**
     * Returns an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) compliant string shortened to minimum length, for example `PT9M`.
     *
     * ```js
     * var parse = require('postgres-interval')
     * var interval = parse('01:02:03')
     * // => { hours: 1, minutes: 2, seconds: 3 }
     * interval.toISOStringShort()
     * // PT1H2M3S
     * ```
     */
    toISOStringShort(): string;
  }
}

/**
 * Parse Postgres interval columns.
 *
 * ```js
 * var parse = require('postgres-interval')
 * var interval = parse('01:02:03')
 * // => { hours: 1, minutes: 2, seconds: 3 }
 * interval.toPostgres()
 * // 1 hour 2 minutes 3 seconds
 * interval.toISOString()
 * // P0Y0M0DT1H2M3S
 * interval.toISOStringShort()
 * // PT1H2M3S
 * ```
 *
 * @param raw A Postgres interval string.
 */
declare function PostgresInterval(raw: string): PostgresInterval.IPostgresInterval;

export = PostgresInterval;
