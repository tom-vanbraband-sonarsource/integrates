import { RouteComponentProps } from "react-router";

export interface IProjectTagsAttr {
  project: {
    deletionDate: string;
    name: string;
    subscription: string;
    tags: string[];
  };
}

export interface IRemoveTagsAttr {
  removeTag: {
    project: {
      deletionDate: string;
      name: string;
      subscription: string;
      tags: string[];
    };
    success: boolean;
  };
}

export interface IAddTagsAttr {
  addTags: {
    project: {
      deletionDate: string;
      name: string;
      subscription: string;
      tags: string[];
    };
    success: boolean;
  };
}

export interface IHistoricState {
  date: string;
  state: string;
  user: string;
}

export interface IRepositoriesAttr {
  branch: string;
  historic_state: IHistoricState[];
  protocol: string;
  state: string;
  urlRepo: string;
}

export interface IResourcesAttr {
  me?: {
    role: string;
  };
  resources: {
    environments: string;
    repositories: string;
  };
}

export interface IUpdateRepoAttr {
  updateResources: {
    resources: {
      repositories: string;
    };
    success: boolean;
  };
}

export interface IAddReposAttr {
  addResources: {
    resources: {
      repositories: string;
    };
    success: boolean;
  };
}

export interface IEnvironmentsAttr {
  historic_state: IHistoricState[];
  state: string;
  urlEnv: string;
}

export interface IUpdateEnvAttr {
  updateResources: {
    resources: {
      environments: string;
    };
    success: boolean;
  };
}

export interface IAddEnvAttr {
  addResources: {
    resources: {
      environments: string;
    };
    success: boolean;
  };
}

export interface IGetProjectData {
  project: {
    deletionDate: string;
  };
}

export type ISettingsViewProps = RouteComponentProps<{ projectName: string }>;
