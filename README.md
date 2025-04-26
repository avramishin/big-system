### API

### Monolog

Monolog is a service for storing and managing log entries across the system. It provides functionality to:

- Create log entries with:

  - Service name
  - Message text (up to 255 bytes)
  - Optional context data (up to 65KB JSON)
  - Optional reference number (8 chars)
  - Optional keywords for searching (up to 10)
  - Configurable expiration time (60s - 2 weeks)

- Search logs by:

  - Time range
  - Service name
  - Message prefix
  - Reference number (RRN)
  - Keywords
  - With pagination support

- Maintenance operations:
  - Delete expired logs
  - Delete all logs

The service exposes a REST API and provides a client library for easy integration.
