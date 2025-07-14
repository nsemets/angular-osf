export interface PreprintRelatedCountJsonApi {
  relationships: {
    preprints: {
      links: {
        related: {
          meta: {
            accepted: number;
            initial: number;
            pending: number;
            rejected: number;
            withdrawn: number;
          };
        };
      };
    };
  };
}
