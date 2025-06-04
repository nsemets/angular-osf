import { WikiModes } from '../models';

export class GetHomeWiki {
  static readonly type = '[Wiki] Get Home Wiki';

  constructor(public projectId: string) {}
}

export class ClearWiki {
  static readonly type = '[Wiki] Clear Wiki';
}

export class GetWikiModes {
  static readonly type = '[Wiki] Get Wiki Modes';

  constructor(public projectId: string) {}
}

export class ToggleMode {
  static readonly type = '[Wiki] Toggle Mode';
  constructor(public mode: WikiModes) {}
}
