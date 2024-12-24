# Queue and Dead Letter Queue (DLQ) - Proof of Concept

This repository is a **Proof of Concept (PoC)** demonstrating the implementation of message queues and Dead Letter Queues (DLQ). The goal of this project is to validate the technical viability of using queues for message processing, and to introduce the concept of Dead Letter Queues to handle failed message processing.

## Concepts

### Message Queue

A **Message Queue** (MQ) is a communication method used in distributed systems, allowing messages to be sent between components in an asynchronous manner. It ensures that messages are held in the queue until the receiving system is ready to process them, providing decoupling between components.

### Dead Letter Queue (DLQ)

A **Dead Letter Queue** (DLQ) is a specialized queue used to hold messages that could not be processed successfully by the primary queue. This is particularly useful for handling errors or unexpected conditions, ensuring that failed messages are not lost and can be reviewed or retried later.

## Purpose of this PoC

The purpose of this Proof of Concept is to:

1. **Demonstrate the use of Message Queues** for reliable and asynchronous message handling.
2. **Implement a Dead Letter Queue** to handle messages that fail to be processed by the main queue.
3. **Evaluate the effectiveness** of this architecture for error handling and message reliability in real-world scenarios.

## Project Structure

The code in this repository is designed to simulate a basic message queue system with a corresponding Dead Letter Queue. It demonstrates the following:

- Sending messages to the main queue.
- Processing messages from the main queue, with a possibility of failure.
- If processing fails, messages are moved to the Dead Letter Queue.
- Handling of failed messages for analysis or retries.

## Features

- **Message Queue**: Messages are processed asynchronously and can be held in the queue until ready for processing.
- **Dead Letter Queue**: Failed messages are stored in a separate queue for analysis or further action.
- **Error Handling**: Demonstrates how to handle failures in message processing and move problematic messages to the DLQ.

## How It Works

1. **Main Queue**: Messages are pushed to the main queue.
2. **Processing**: Messages are dequeued and processed. If processing is successful, the message is removed from the queue.
3. **Failure Handling**: If an error occurs while processing a message, the message is sent to the Dead Letter Queue for further inspection.

## Setup and Usage

To run the PoC locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone <repository_url>
   ```

2. Install the necessary dependencies (replace with your package manager if necessary):

   ```bash
   npm install
   ```

3. Start the application:

   ```bash
   npm start
   ```

4. You can simulate sending messages to the queue and processing them. Failed messages will be redirected to the Dead Letter Queue.

## Example Workflow

1. **Send a message** to the main queue.
2. **Process the message** from the main queue. If the message processing succeeds, it is removed from the queue.
3. If the message **fails**, it is moved to the **Dead Letter Queue** for further handling or investigation.

## Future Improvements

This PoC can be expanded with the following improvements:

- **Automatic retries**: Messages in the Dead Letter Queue can be retried after a delay.
- **Logging**: Better logging for tracking message status, success, and failure.
- **Scalability**: Explore ways to scale the message processing system for higher throughput.
- **Monitoring**: Implement monitoring tools to track queue status and processing metrics.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
