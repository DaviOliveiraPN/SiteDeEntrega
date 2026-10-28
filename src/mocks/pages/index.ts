import { expiredEvent } from './expired-event';
import { juliaPedro } from './julia-pedro';
import { marinaLucas } from './marina-lucas';
import type { MockPage } from './types';

export const mockPages: MockPage[] = [marinaLucas, juliaPedro, expiredEvent];
export type { MockPage };
