# Answer to Task 1:

1. Database Connection Pool Exhaustion
   - The primary DB (10.10.2.14) shows connection timeout and deadlock errors
   - Too many concurrent connections or long-running queries may have exhausted the pool
   - Retry logic triggered but eventually failed

2. Redis Cache Failure
   - Connection refused on 10.10.2.20:6379 means Redis is either down or unreachable
   - Orders service fell back to database query, adding load to already struggling DB

3. Database Server Issues
   - Multiple issues: connection timeout, deadlock detected (TRX991)
   - Could be due to heavy load, hardware issues, or misconfiguration
   - Transaction conflicts causing deadlocks

4. Network Connectivity Issues
   - Both primary DB and Redis have connection issues
   - Could be network partition, firewall rules, or infrastructure problems

5. Orders Service Resource Constraints
   - Pod restart initiated suggests the service may have been OOMKilled or crashed
   - Could indicate insufficient resources allocated

# Answer to Task 2:

1. Initial Investigation
   - Review logs to identify error patterns and timestamps
   - Check which services are affected and their dependencies
   - Identify if issue is isolated or widespread

2. Infrastructure Checks
   - Verify database and Redis server status
   - Check network connectivity between services
   - Review load balancer and API gateway logs
   - Check Kubernetes pod status and resource usage

3. Database Investigation
   - Check active connections and connection pool settings
   - Review long-running queries and slow query logs
   - Analyze deadlock logs and transaction patterns
   - Check database server CPU, memory, and disk I/O

4. Application Investigation
   - Review orders service logs for exceptions
   - Check retry logic and circuit breaker status
   - Verify timeout configurations are appropriate

5. Resolution Steps
   - Restart/replace failed pods
   - Scale up services if needed
   - Clear connection pools if exhausted
   - Apply database migrations if deadlock is schema-related

# Answer to Task 3:

Slow Response Investigation:

1. Enable query logging to identify slow queries (>1s threshold)
2. Check database execution plans for missing indexes
3. Review connection pool metrics and wait times
4. Analyze application-level tracing for bottlenecks
5. Check for N+1 query problems in ORM
6. Review network latency between services and database

Database Timeout Investigation:

1. Check database server resources (CPU, memory, disk)
   - PostgreSQL: Check pg_stat_activity, pg_locks
   - MySQL: Check PROCESSLIST, INNODB STATUS

2. Review connection pool configuration
   - Ensure adequate max connections
   - Check connection leak issues

3. Analyze query performance
   - Use EXPLAIN ANALYZE for slow queries
   - Check for missing indexes on WHERE clauses

4. Review transaction isolation levels
   - Deadlock suggests concurrent transactions competing for resources
   - Consider using SELECT FOR UPDATE or optimistic locking

5. Check network connectivity
   - Verify latency between app and database
   - Check for network congestion or packet loss

# Answer to Task 4:

High Error Rate Alert:

- Metric: error_rate > threshold over 5-minute window
- Threshold: > 5% error rate
- Severity: Warning
- Action: Page on-call engineer

Slow Response Alert:

- Metric: p95_response_time > threshold
- Threshold: > 2000ms for /api/orders
- Severity: Warning
- Action: Notify team, investigate slow queries

Database Failure Alert:

- Metric: db_connection_errors > 0
- Threshold: Any connection failures
- Severity: Critical
- Action: Immediate page, auto-scale if configured

Additional Recommended Alerts:

- Pod restart frequency > 2 per hour
- Redis connection failures > 3 in 5 minutes
- Database deadlock count > 0
- High CPU usage > 80% for any service
- Memory usage > 85% for any pod

# Answer to Task 5:

Reliability:

- Implement circuit breaker pattern for database calls
- Add retry with exponential backoff and jitter
- Configure dead letter queue for failed requests
- Set up multi-zone database redundancy
- Implement graceful degradation when cache fails

Observability:

- Distributed tracing with OpenTelemetry/Jaeger
- Structured logging with correlation IDs
- Custom metrics for business KPIs
- Dashboards for service dependency health
- Alert on SLO violations (99.9% availability)

Scalability:

- Auto-scaling based on CPU/memory or custom metrics
- Read replicas for database to handle read-heavy queries
- Implement pagination for large result sets
- Add connection pooling (PgBouncer for PostgreSQL)
- Cache frequently accessed data with TTL

Security:

- Implement API rate limiting per user/IP
- Add encryption in transit (TLS) for all connections
- Use secrets management (Vault) for credentials
- Implement IP allowlisting for database access
- Add request validation and sanitization
- Implement audit logging for sensitive operations

# Answer to Task 6:

Application Monitoring:

- Prometheus + Grafana: Metrics collection and visualization
- Jaeger/Zipkin: Distributed tracing
- ELK Stack (Elasticsearch, Logstash, Kibana): Log aggregation

Infrastructure Monitoring:

- Datadog/Dynatrace: Full-stack observability
- CloudWatch/GCP Monitoring: Cloud-native monitoring
- cAdvisor/Prometheus Node Exporter: Container and host metrics

Database Monitoring:

- pgMonitor (PostgreSQL): Database-specific metrics
- Redis Insights: Cache monitoring
- Query analyzers for slow query detection

Alerting:

- PagerDuty/OpsGenie: Alert routing and on-call management
- Prometheus Alertmanager: Alert aggregation and routing

Logging:

- Fluentd/Fluent Bit: Log collection
- Loki: Log aggregation compatible with Prometheus

Recommended Stack:

- Prometheus + Grafana for metrics
- Jaeger for tracing
- ELK or Loki for logs
- PagerDuty for alerting
- Kubernetes-native monitoring (Metrics Server + KEDA)
