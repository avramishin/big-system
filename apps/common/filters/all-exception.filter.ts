import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { parseNodeErrorStack } from '../parse-node-error-stack';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(e: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = e.message;

    if ((e as HttpException).getStatus) {
      status = (e as HttpException).getStatus();
      message = ((e as HttpException).getResponse() as any).message;
    }

    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    console.error(
      JSON.stringify({
        message,
        url: request.url,
        body: request.body,
        query: request.query,
      }),
    );

    response.status(status).send({
      statusCode: status,
      message,
      path: request.url,
    });
  }
}
