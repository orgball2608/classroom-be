import { Global, Module, type Provider } from '@nestjs/common';

const providers: Provider[] = [];

@Global()
@Module({
  providers: [...providers],
})
export class SharedModule {}
