import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import winston from 'winston'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const logsDirectory = path.join(currentDirectory, '..', 'logs')
fs.mkdirSync(logsDirectory, { recursive: true })

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'task-72-error-logging' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logsDirectory, 'error.log'),
      level: 'error',
      maxsize: 5_000_000,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, 'combined.log'),
      maxsize: 5_000_000,
      maxFiles: 5,
    }),
  ],
})

export function serializeError(error) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack }
  }

  return { message: String(error) }
}