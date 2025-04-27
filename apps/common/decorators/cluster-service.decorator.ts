import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClusterService = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().headers['x-cluster-service'];
  },
);
