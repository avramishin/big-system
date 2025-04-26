import { FastifyRequest, FastifyReply } from 'fastify';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(e: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();
    const req = ctx.getRequest<FastifyRequest>();

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
        url: req.url,
        body: req.body,
        query: req.query,
      }),
    );

    res.status(status).send({
      statusCode: status,
      message,
      path: req.url,
    });
  }
}
