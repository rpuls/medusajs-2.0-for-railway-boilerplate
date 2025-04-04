'use strict'

module.exports = PostgresInterval

function PostgresInterval (raw) {
  if (!(this instanceof PostgresInterval)) {
    return new PostgresInterval(raw)
  }

  this.years = 0
  this.months = 0
  this.days = 0
  this.hours = 0
  this.minutes = 0
  this.seconds = 0
  this.milliseconds = 0

  parse(this, raw)
}

PostgresInterval.prototype.toPostgres = function () {
  let postgresString = ''

  if (this.years) {
    postgresString += this.years === 1 ? this.years + ' year' : this.years + ' years'
  }

  if (this.months) {
    if (postgresString.length) {
      postgresString += ' '
    }

    postgresString += this.months === 1 ? this.months + ' month' : this.months + ' months'
  }

  if (this.days) {
    if (postgresString.length) {
      postgresString += ' '
    }

    postgresString += this.days === 1 ? this.days + ' day' : this.days + ' days'
  }

  if (this.hours) {
    if (postgresString.length) {
      postgresString += ' '
    }

    postgresString += this.hours === 1 ? this.hours + ' hour' : this.hours + ' hours'
  }

  if (this.minutes) {
    if (postgresString.length) {
      postgresString += ' '
    }

    postgresString += this.minutes === 1 ? this.minutes + ' minute' : this.minutes + ' minutes'
  }

  if (this.seconds || this.milliseconds) {
    if (postgresString.length) {
      postgresString += ' '
    }

    if (this.milliseconds) {
      const value = Math.trunc((this.seconds + this.milliseconds / 1000) * 1000000) / 1000000

      postgresString += value === 1 ? value + ' second' : value + ' seconds'
    } else {
      postgresString += this.seconds === 1 ? this.seconds + ' second' : this.seconds + ' seconds'
    }
  }

  return postgresString === '' ? '0' : postgresString
}

const propertiesISOEquivalent = {
  years: 'Y',
  months: 'M',
  days: 'D',
  hours: 'H',
  minutes: 'M',
  seconds: 'S'
}

// according to ISO 8601
PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO =
  function () {
    return toISOString.call(this, { short: false })
  }

PostgresInterval.prototype.toISOStringShort = function () {
  return toISOString.call(this, { short: true })
}

function toISOString ({ short }) {
  let datePart = ''

  if (!short || this.years) {
    datePart += this.years + propertiesISOEquivalent.years
  }

  if (!short || this.months) {
    datePart += this.months + propertiesISOEquivalent.months
  }

  if (!short || this.days) {
    datePart += this.days + propertiesISOEquivalent.days
  }

  let timePart = ''

  if (!short || this.hours) {
    timePart += this.hours + propertiesISOEquivalent.hours
  }

  if (!short || this.minutes) {
    timePart += this.minutes + propertiesISOEquivalent.minutes
  }

  if (!short || (this.seconds || this.milliseconds)) {
    if (this.milliseconds) {
      timePart += (Math.trunc((this.seconds + this.milliseconds / 1000) * 1000000) / 1000000) + propertiesISOEquivalent.seconds
    } else {
      timePart += this.seconds + propertiesISOEquivalent.seconds
    }
  }

  if (!timePart && !datePart) {
    return 'PT0S'
  }

  if (!timePart) {
    return `P${datePart}`
  }

  return `P${datePart}T${timePart}`
}

const position = { value: 0 }

function readNextNum (interval) {
  let val = 0

  while (position.value < interval.length) {
    const char = interval[position.value]

    if (char >= '0' && char <= '9') {
      val = val * 10 + +char
      position.value++
    } else {
      break
    }
  }

  return val
}

function parseMillisecond (interval) {
  const previousPosition = position.value
  const currentValue = readNextNum(interval)
  const valueStringLength = position.value - previousPosition

  switch (valueStringLength) {
    case 1:
      return currentValue * 100
    case 2:
      return currentValue * 10
    case 3:
      return currentValue
    case 4:
      return currentValue / 10
    case 5:
      return currentValue / 100
    case 6:
      return currentValue / 1000
  }

  // slow path
  const remainder = valueStringLength - 3
  return currentValue / Math.pow(10, remainder)
}

function parse (instance, interval) {
  if (!interval) {
    return
  }

  position.value = 0

  let currentValue
  let nextNegative = 1

  while (position.value < interval.length) {
    const char = interval[position.value]

    if (char === '-') {
      nextNegative = -1
      position.value++
      continue
    } else if (char === '+') {
      position.value++
      continue
    } else if (char === ' ') {
      position.value++
      continue
    } else if (char < '0' || char > '9') {
      position.value++
      continue
    } else {
      currentValue = readNextNum(interval)

      if (interval[position.value] === ':') {
        instance.hours = currentValue ? nextNegative * currentValue : 0

        position.value++
        currentValue = readNextNum(interval)
        instance.minutes = currentValue ? nextNegative * currentValue : 0

        position.value++
        currentValue = readNextNum(interval)
        instance.seconds = currentValue ? nextNegative * currentValue : 0

        if (interval[position.value] === '.') {
          position.value++

          currentValue = parseMillisecond(interval)
          instance.milliseconds = currentValue ? nextNegative * currentValue : 0
        }

        return
      }

      // skip space
      position.value++

      const unit = interval[position.value]

      if (unit === 'y') {
        instance.years = currentValue ? nextNegative * currentValue : 0
      } else if (unit === 'm') {
        instance.months = currentValue ? nextNegative * currentValue : 0
      } else if (unit === 'd') {
        instance.days = currentValue ? nextNegative * currentValue : 0
      }

      nextNegative = 1
    }
  }
}

PostgresInterval.parse = function (interval) {
  const instance = {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  }

  parse(instance, interval)

  return instance
}
