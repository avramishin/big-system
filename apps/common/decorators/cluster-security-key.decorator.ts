import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClusterSecurityKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().headers['x-cluster-security-key'];
  },
);
