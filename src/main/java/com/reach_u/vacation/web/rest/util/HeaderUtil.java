package com.reach_u.vacation.web.rest.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;

/**
 * Utility class for HTTP headers creation.
 */
public class HeaderUtil {

    private static final Logger log = LoggerFactory.getLogger(HeaderUtil.class);

    public static HttpHeaders createAlert(String message, String param) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-vacationTrackerApp-alert", message);
        headers.add("X-vacationTrackerApp-params", param);
        return headers;
    }

    public static HttpHeaders createEntityCreationAlert(String entityName, String param) {
        return createAlert("vacationTrackerApp." + entityName + ".created", param);
    }

    public static HttpHeaders createEntityUpdateAlert(String entityName, String param) {
        return createAlert("vacationTrackerApp." + entityName + ".updated", param);
    }

    public static HttpHeaders createCustomVacationUpdateAlert(String i18n, String param) {
        return createAlert("vacationTrackerApp.vacation." + i18n, param);
    }

    public static HttpHeaders createEntityDeletionAlert(String entityName, String param) {
        return createAlert("vacationTrackerApp." + entityName + ".deleted", param);
    }

    public static HttpHeaders createFailureAlert(String entityName, String errorKey, String defaultMessage) {
        log.error("Entity creation failed, {}", defaultMessage);
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-vacationTrackerApp-error", "error." + errorKey);
        headers.add("X-vacationTrackerApp-params", entityName);
        return headers;
    }
}
