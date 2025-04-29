import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClusterClientName = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().headers['x-ccn'];
  },
);
