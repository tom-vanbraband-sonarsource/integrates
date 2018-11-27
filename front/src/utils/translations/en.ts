const enTranslations: Map<string, string> = {
  confirmmodal: {
    cancel: "Cancel",
    proceed: "Proceed",
  },
  legalNotice: {
    acceptBtn: {
      text: "Accept and continue",
      tooltip: "Click if you understand and accept the terms above",
    },
    description: "Integrates, Copyright (c) 2018 FLUID. This platform contains \
    information proprietary of Fluidsignal Group. The client is only allowed \
    to use such information for documentation purposes and without disclosing \
    its content to third parties because it may contain ideas, concepts, prices \
    and/or structures propriety of Fluidsignal Group S.A. Its 'proprietary' \
    classification means that this information will only be used by those who \
    it was meant for. In case of requiring total or partial reproductions it \
    must be done with express and written authorization of Fluidsignal Group \
    S.A. The rules that fundament the classification of information are \
    articles 72, Cartagena's agreement 344 of 1.993, article 238 of penal code \
    and articles 16 and its following ones from 256 law of 1.996.",
    rememberCbo: {
      text: "Remember my decision",
      tooltip: "Mark the checkbox if you want this decision to be permanent",
    },
    title: "Legal notice",
  },
  proj_alerts: {
    access_denied: "Access denied or project not found",
    error_textsad: "There is an error :(",
    file_size: "The file size must be less than 10mb",
    file_size_png: "The image size must be less than 2mb",
    file_size_py: "The file size must be less than 1mb",
    file_type_csv: "The file must be .csv type",
    file_type_gif: "The image must be .gif type",
    file_type_png: "The image must be .png type",
    file_type_py: "The file must be .py type",
    file_type_wrong: "The file has an unknown or non-allowed format",
    file_updated: "File Updated ;)",
    no_file_selected: "No file selected",
    no_file_update: "Failed to update the file",
    title_success: "Congratulations",
  },
  search_findings: {
    environment_table: {
      environment: "Environment",
    },
    repositories_table: {
      branch: "Branch",
      repository: "Repository",
    },
    tab_description: {
      action: "Action",
      errorFileVuln: "Vulnerabilities file has errors",
      field: "Field",
      inputs: "Inputs",
      line: "Line",
      line_plural: "Lines",
      path: "Path",
      port: "Port",
      port_plural: "Ports",
      vulnDeleted: "Vulnerability was deleted of this finding",
    },
    tab_evidence: {
      editable: "Edit",
      update: "Update",
    },
    tab_resources: {
      add_repository: "Add",
      branch: "Branch",
      environment: "Environment",
      environments_title: "Environments",
      modal_env_title: "Add environment information",
      modal_repo_title: "Add repository information",
      no_selection: "You must select an item from the table.",
      remove_repository: "Remove",
      repeated_item: "One or more items to add already exist.",
      repositories_title: "Repositories",
      repository: "Repository",
      success: "Item added successfully.",
      success_remove: "Item removed successfully.",
    },
    tab_severity: {
      authentication: "Authentication",
      authentication_options: {
        multiple_auth: "Multiple: Multiple authentication points",
        no_auth: "None: Authentication is not required",
        single_auth: "Single: Single authentication point",
      },
      availability: "Availability Impact",
      availability_options: {
        complete: "Complete: There is a total target down",
        none: "None: There is no impact",
        partial: "Partial: There is intermittency in the access to the target",
      },
      complexity: "Access Complexity",
      complexity_options: {
        high_complex: "High: Special conditions are required like administrative access",
        low_complex: "Low: No special conditions are required",
        medium_complex: "Medium: Some conditions are required like system access",
      },
      confidence: "Confidence Level",
      confidence_options: {
        confirmed: "Confirmed: The vulnerability is recognized by the manufacturer",
        not_confirm: "Not confirmed: There are few sources that recognize vulnerability",
        not_corrob: "Not corroborared: Vulnerability is recognized by unofficial sources",
      },
      confidentiality: "Confidentiality Impact",
      confidentiality_options: {
        complete: "Complete: Total control over information related with the target",
        none: "None: There is no impact",
        partial: "Partial: Access to information but no control over it",
      },
      editable: "Edit",
      exploitability: "Exploitability",
      exploitability_options: {
        conceptual: "Conceptual: There are laboratory tests",
        functional: "Functional: There is an exploit",
        high: "High: Exploit is not required or it can be automated",
        improbable: "Improbable: There is no exploit",
      },
      integrity: "Integrity Impact",
      integrity_options: {
        complete: "Complete: Posibility of modify all target information",
        none: "None: There is no impact",
        partial: "Partial: Posibility of modify some target information",
      },
      resolution: "Resolution Level",
      resolution_options: {
        non_existent: "Non-existent: There is no solution",
        official: "Official: There is an manufacturer available patch",
        palliative: "Palliative: There is a patch that was not published by the manufacturer",
        temporal: "Temporal: There are temporary solutions",
      },
      update: "Update",
      vector: "Access Vector",
      vector_options: {
        adjacent: "Adjacent network: Exploitable from same network segment",
        local: "Local: Exploitable with local access to the target",
        network: "Network: Exploitable from Internet",
      },
    },
    tab_users: {
      add_button: "Add",
      admin: "Admin",
      analyst: "Analyst",
      customer: "User",
      customer_admin: "Manager",
      days_ago: "{{count}} day ago",
      days_ago_plural: "{{count}} days ago",
      edit: "Edit",
      edit_user_title: "Edit user information",
      email: "someone@domain.com",
      hours_ago: "{{count}} hour ago",
      hours_ago_plural: "{{count}} hours ago",
      minutes_ago: "{{count}} minute ago",
      minutes_ago_plural: "{{count}} minutes ago",
      months_ago: "{{count}} month ago",
      months_ago_plural: "{{count}} months ago",
      no_selection: "You must select an email from the table.",
      phone_number: "Phone Number",
      remove_user: "Remove",
      responsibility_placeholder: "Product Owner, Project Manager, " +
                                     "Tester, ...",
      role: "Role",
      success: " now has access to this project.",
      success_admin: "User information updated.",
      success_delete: " was removed from this project.",
      textbox: "Enter the email of the person you wish to add, it must be " +
                   "an Office 365 or Google email",
      title: "Add user to this project",
      title_success: "Congratulations",
      user_organization: "Organization",
      user_responsibility: "Responsibility",
    },
    users_table: {
      firstlogin: "First login",
      lastlogin: "Last login",
      phoneNumber: "Phone Number",
      userOrganization: "Organization",
      userResponsibility: "Responsibility",
      userRole: "Role",
      usermail: "User email",
    },
  },
};

export = enTranslations;
