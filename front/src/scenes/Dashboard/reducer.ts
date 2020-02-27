import _ from "lodash";
import * as actions from "./actions";
import * as vulnerabilitiesActions from "./components/Vulnerabilities/actionTypes";
import { IDescriptionViewProps } from "./containers/DescriptionView";
import * as descriptionActions from "./containers/DescriptionView/actionTypes";
import * as projectActions from "./containers/ProjectContent/actionTypes";
import * as resourcesActions from "./containers/ProjectSettingsView/actionTypes";
import * as usersActions from "./containers/ProjectUsersView/actionTypes";

export interface IDashboardState {
  addUserModal: { addUserOpen: boolean };
  description: Pick<IDescriptionViewProps, "dataset" | "isEditing" | "isRemediationOpen">;
  resources: {
    defaultSort: {
      environments: {};
      files: {};
      tags: {};
    };
    envModal: {
      open: boolean;
    };
    files: Array<{ description: string; fileName: string; uploadDate: string}>;
    filesModal: {
      open: boolean;
    };
    filters: {
      stateEnvironments: string;
    };
    optionsModal: {
      open: boolean;
      rowInfo: { fileName: string };
    };
    showUploadProgress: boolean;
    uploadProgress: number;
  };
  tags: {
    tagsModal: {
      open: boolean;
    };
  };
  updateAccessTokenModal: { open: boolean };
  user: {
    role: string;
  };
  users: {
    addModal: {
      initialValues: {};
      open: boolean;
      type: "add" | "edit";
    };
  };
  vulnerabilities: {
    filters: {
      filterInputs: string;
      filterLines: string;
      filterPending: string;
      filterPorts: string;
    };
    sorts: {
      sortInputs: {};
      sortLines: {};
      sortPorts: {};
    };
  };
}

const initialState: IDashboardState = {
  addUserModal: { addUserOpen: false },
  description: {
    dataset: {
      acceptanceDate: "",
      acceptationApproval: "",
      acceptationUser: "",
      actor: "",
      affectedSystems: "",
      analyst: "",
      attackVectorDesc: "",
      btsUrl: "",
      clientCode: "",
      clientProject: "",
      compromisedAttributes: "",
      compromisedRecords: "",
      cweUrl: "",
      description: "",
      historicTreatment: [{date: "", treatment: "", user: ""}],
      justification: "",
      openVulnerabilities: "",
      recommendation: "",
      releaseDate: "",
      remediated: false,
      requirements: "",
      risk: "",
      scenario: "",
      state: "",
      subscription: "",
      threat: "",
      title: "",
      treatment: "",
      treatmentManager: "",
      type: "",
      userEmails: [{ email: "" }],
    },
    isEditing: false,
    isRemediationOpen : false,
  },
  resources: {
    defaultSort: {
      environments: {},
      files: {},
      tags: {},
    },
    envModal: {
      open: false,
    },
    files: [],
    filesModal: {
      open: false,
    },
    filters: {
      stateEnvironments: "",
    },
    optionsModal: {
      open: false,
      rowInfo: {fileName: ""},
    },
    showUploadProgress: false,
    uploadProgress: 0,
  },
  tags: {
    tagsModal: {
      open: false,
    },
  },
  updateAccessTokenModal: { open: false },
  user: {
    role: "",
  },
  users: {
    addModal: {
      initialValues: {},
      open: false,
      type: "add",
    },
  },
  vulnerabilities: {
    filters: {
      filterInputs: "",
      filterLines: "",
      filterPending: "",
      filterPorts: "",
    },
    sorts: {
      sortInputs: {},
      sortLines: {},
      sortPorts: {},
    },
  },
};

const actionMap: {
  [key: string]: ((arg1: IDashboardState, arg2: actions.IActionStructure) => IDashboardState);
} = {};

actionMap[vulnerabilitiesActions.CHANGE_FILTERS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    vulnerabilities: {
      ...state.vulnerabilities,
      filters: action.payload.filters,
    },
  });

actionMap[vulnerabilitiesActions.CHANGE_SORTS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    vulnerabilities: {
      ...state.vulnerabilities,
      sorts: action.payload.sorts,
    },
  });

actionMap[resourcesActions.CHANGE_FILTERS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      filters: action.payload.filters,
    },
  });

actionMap[resourcesActions.CHANGE_SORTED] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      defaultSort: action.payload.defaultSort,
    },
  });

actionMap[resourcesActions.LOAD_RESOURCES] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      files: action.payload.files,
    },
  });

actionMap[resourcesActions.OPEN_ENVIRONMENTS_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      envModal: {
        ...state.resources.envModal,
        open: true,
      },
    },
  });

actionMap[resourcesActions.CLOSE_ENVIRONMENTS_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      envModal: {
        ...initialState.resources.envModal,
      },
    },
  });

actionMap[resourcesActions.OPEN_FILES_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      filesModal: {
        ...state.resources.filesModal,
        open: true,
      },
    },
  });

actionMap[resourcesActions.CLOSE_FILES_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      filesModal: {
        ...initialState.resources.filesModal,
      },
    },
  });

actionMap[resourcesActions.OPEN_OPTIONS_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      optionsModal: {
        ...state.resources.optionsModal,
        open: true,
        rowInfo: action.payload.rowInfo,
      },
    },
  });

actionMap[resourcesActions.CLOSE_OPTIONS_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      optionsModal: {
        ...initialState.resources.optionsModal,
      },
    },
  });

actionMap[resourcesActions.OPEN_TAGS_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    tags: {
      ...state.tags,
      tagsModal: {
        ...state.tags.tagsModal,
        open: true,
      },
    },
  });

actionMap[resourcesActions.CLOSE_TAGS_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    tags: {
      ...state.tags,
      tagsModal: initialState.tags.tagsModal,
    },
  });

actionMap[resourcesActions.UPDATE_UPLOAD_PROGRESS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      uploadProgress: action.payload.percentCompleted,
    },
  });

actionMap[resourcesActions.SHOW_UPLOAD_PROGRESS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      showUploadProgress: !state.resources.showUploadProgress,
    },
  });

actionMap[usersActions.OPEN_USERS_MDL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    users: {
      ...state.users,
      addModal: {
        ...state.users.addModal,
        initialValues: action.payload.initialValues,
        open: true,
        type: action.payload.type,
      },
    },
  });

actionMap[usersActions.CLOSE_USERS_MDL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    users: {
      ...state.users,
      addModal: initialState.users.addModal,
    },
  });

actionMap[descriptionActions.LOAD_DESCRIPTION] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    description: {
      ...state.description,
      dataset: {...state.description.dataset, ...action.payload.descriptionData},
    },
  });

actionMap[descriptionActions.EDIT_DESCRIPTION] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    description: {
      ...state.description,
      isEditing: !state.description.isEditing,
    },
  });

actionMap[descriptionActions.OPEN_REMEDIATION_MDL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState => ({
    ...state,
    description: {
      ...state.description,
      isRemediationOpen: true,
    },
  });

actionMap[descriptionActions.CLOSE_REMEDIATION_MDL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState => ({
    ...state,
    description: {
      ...state.description,
      isRemediationOpen: false,
    },
  });

actionMap[descriptionActions.CLEAR_DESCRIPTION] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
    ({
      ...state,
      description: initialState.description,
    });

actionMap[projectActions.LOAD_PROJECT] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState => ({
    ...state,
    user: {
      ...state.user,
      role: action.payload.role,
    },
  });

actionMap[projectActions.CLEAR_PROJECT_STATE] = (state: IDashboardState): IDashboardState => ({
  ...state,
  resources: {
    ...initialState.resources,
    defaultSort: {
      ...state.resources.defaultSort,
    },
    filters: {
      ...state.resources.filters,
    },
  },
  users: initialState.users,
});

type DashboardReducer = ((
  arg1: IDashboardState | undefined,
  arg2: actions.IActionStructure,
) => IDashboardState);

export const dashboard: DashboardReducer =
  (state: IDashboardState = initialState,
   action: actions.IActionStructure): IDashboardState => {
  if (action.type in actionMap) {
    return actionMap[action.type](state, action);
  } else {
    return state;
  }
};
