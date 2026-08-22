package com.department.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.logging.Logger;

@Service
public class DatabaseService {
    private static final Logger logger = Logger.getLogger(DatabaseService.class.getName());

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Get all tables available in the database dynamically
     */
    public List<String> getAllDatabaseTables() {
        try {
            String query = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME";
            List<String> tables = jdbcTemplate.queryForList(query, String.class);
            logger.info("Found " + tables.size() + " tables in database");
            return tables;
        } catch (Exception e) {
            logger.warning("Error fetching database tables: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Clear data from specified table
     */
    public void clearTableData(String tableName) {
        try {
            // Validate table name to prevent SQL injection
            if (!isValidTableName(tableName)) {
                throw new IllegalArgumentException("Invalid table name: " + tableName);
            }

            // Get total rows before clearing
            int rowsBefore = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Integer.class);
            logger.info("Clearing table: " + tableName + " (rows before: " + rowsBefore + ")");

            // Clear the table
            jdbcTemplate.update("TRUNCATE TABLE " + tableName);
            
            logger.info("Successfully cleared table: " + tableName);
        } catch (Exception e) {
            logger.warning("Error clearing table " + tableName + ": " + e.getMessage());
            throw new RuntimeException("Failed to clear table " + tableName + ": " + e.getMessage());
        }
    }

    /**
     * Clear data from multiple tables
     */
    public void clearMultipleTables(List<String> tableNames) {
        try {
            // Disable foreign key checks temporarily
            jdbcTemplate.update("SET FOREIGN_KEY_CHECKS=0");

            for (String tableName : tableNames) {
                try {
                    clearTableData(tableName);
                } catch (Exception e) {
                    // Log but continue with other tables
                    logger.warning("Failed to clear table " + tableName + ": " + e.getMessage());
                }
            }

            // Re-enable foreign key checks
            jdbcTemplate.update("SET FOREIGN_KEY_CHECKS=1");
            logger.info("Successfully cleared " + tableNames.size() + " tables");
        } catch (Exception e) {
            logger.severe("Error clearing multiple tables: " + e.getMessage());
            throw new RuntimeException("Failed to clear tables: " + e.getMessage());
        }
    }

    /**
     * Get row count for a specific table
     */
    public long getTableRowCount(String tableName) {
        try {
            if (!isValidTableName(tableName)) {
                throw new IllegalArgumentException("Invalid table name: " + tableName);
            }
            return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Long.class);
        } catch (Exception e) {
            logger.warning("Error getting row count for table " + tableName + ": " + e.getMessage());
            return 0;
        }
    }

    /**
     * Validate table name to prevent SQL injection
     * Only allows alphanumeric and underscore characters
     */
    private boolean isValidTableName(String tableName) {
        if (tableName == null || tableName.trim().isEmpty()) {
            return false;
        }
        // Check if table name matches expected pattern (letters, numbers, underscore only)
        return tableName.matches("^[a-zA-Z0-9_]+$");
    }

    /**
     * Get table statistics (row count and size)
     */
    public List<Object> getTableStatistics(String tableName) {
        try {
            if (!isValidTableName(tableName)) {
                throw new IllegalArgumentException("Invalid table name: " + tableName);
            }

            String query = "SELECT " +
                    "TABLE_NAME, " +
                    "TABLE_ROWS, " +
                    "ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb " +
                    "FROM information_schema.TABLES " +
                    "WHERE table_schema = DATABASE() " +
                    "AND TABLE_NAME = ?";

            return jdbcTemplate.queryForList(query, Object.class, tableName);
        } catch (Exception e) {
            logger.warning("Error getting table statistics for " + tableName + ": " + e.getMessage());
            return List.of();
        }
    }
}
