import { WikiModes } from '../models';

export class CreateWiki {
  static readonly type = '[Wiki] Create Wiki';

  constructor(
    public projectId: string,
    public name: string
  ) {}
}

export class GetHomeWiki {
  static readonly type = '[Wiki] Get Home Wiki';

  constructor(public projectId: string) {}
}

export class ClearWiki {
  static readonly type = '[Wiki] Clear Wiki';
}

export class GetWikiList {
  static readonly type = '[Wiki] Get Wiki List';

  constructor(public projectId: string) {}
}

export class GetComponentsWikiList {
  static readonly type = '[Wiki] Get Components Wiki List';

  constructor(public projectId: string) {}
}

export class GetWikiModes {
  static readonly type = '[Wiki] Get Wiki Modes';

  constructor(public projectId: string) {}
}

export class ToggleMode {
  static readonly type = '[Wiki] Toggle Mode';
  constructor(public mode: WikiModes) {}
}

export class GetWikiContent {
  static readonly type = '[Wiki] Get Wiki Content';

  constructor(public content: string) {}
}

export class UpdateWikiContent {
  static readonly type = '[Wiki] Update Wiki Content';

  constructor(public content: string) {}
}
