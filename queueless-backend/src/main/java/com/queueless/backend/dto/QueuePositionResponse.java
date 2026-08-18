package com.queueless.backend.dto;

import com.queueless.backend.entity.QueueStatus;

public class QueuePositionResponse {

    private Integer tokenNumber;
    private QueueStatus status;
    private long peopleAhead;
    private int estimatedWaitMinutes;

    public QueuePositionResponse() {
    }

    public QueuePositionResponse(
            Integer tokenNumber,
            QueueStatus status,
            long peopleAhead,
            int estimatedWaitMinutes
    ) {
        this.tokenNumber = tokenNumber;
        this.status = status;
        this.peopleAhead = peopleAhead;
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public Integer getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(Integer tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public QueueStatus getStatus() {
        return status;
    }

    public void setStatus(QueueStatus status) {
        this.status = status;
    }

    public long getPeopleAhead() {
        return peopleAhead;
    }

    public void setPeopleAhead(long peopleAhead) {
        this.peopleAhead = peopleAhead;
    }

    public int getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }
}