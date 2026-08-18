package com.queueless.backend.dto;

import com.queueless.backend.entity.QueueTicket;

public class CompleteQueueResponse {

    private QueueTicket completed;
    private QueueTicket nextCustomer;
    private String message;

    public CompleteQueueResponse(
            QueueTicket completed,
            QueueTicket nextCustomer,
            String message
    ) {
        this.completed = completed;
        this.nextCustomer = nextCustomer;
        this.message = message;
    }

    public QueueTicket getCompleted() {
        return completed;
    }

    public QueueTicket getNextCustomer() {
        return nextCustomer;
    }

    public String getMessage() {
        return message;
    }
}