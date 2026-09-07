import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'
import { logger, serializeError } from './logger.js'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '32kb' }))
app.use((request, response, next) => {
  request.requestId = crypto.randomUUID()
  response.setHeader('X-Request-Id', request.requestId)
  next()
})

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'error-logging-api' })
})

app.post('/api/logs', (request, response) => {
  const { message, stack, source = 'browser', level = 'error', context = {} } = request.body || {}
  const safeLevel = ['error', 'warn', 'info'].includes(level) ? level : 'error'

  logger.log(safeLevel, message || 'Client-side error', {
    requestId: request.requestId,
    source,
    stack,
    context,
  })

  response.status(202).json({ accepted: true, requestId: request.requestId })
})

app.use((error, request, response, _next) => {
  logger.error('Unhandled request error', {
    requestId: request.requestId,
    ...serializeError(error),
  })
  response.status(500).json({ error: 'Something went wrong.', requestId: request.requestId })
})

const server = app.listen(port, () => {
  logger.info(`Error logging API listening on http://localhost:${port}`)
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', serializeError(error))
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', serializeError(reason))
})

function shutdown(signal) {
  logger.info(`Received ${signal}; shutting down gracefully`)
  server.close(() => process.exit(0))
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))