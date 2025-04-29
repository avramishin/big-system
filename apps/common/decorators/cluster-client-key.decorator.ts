import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClusterClientKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().headers['x-cck'];
  },
);
