/* tslint:disable:jsx-no-multiline-js
 * NO-MULTILINE-JS: Disabling this rule is necessary for the sake of
 * readability of the code in graphql queries
 */
import { ApolloError } from "apollo-client";
import _ from "lodash";
import React from "react";
import { Mutation, MutationFn, MutationResult } from "react-apollo";
import { ButtonToolbar, Col, FormGroup, Row } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useSelector } from "react-redux";
import { Field, formValueSelector, InjectedFormProps } from "redux-form";
import { ConfigurableValidator } from "revalidate";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal/index";
import { handleGraphQLErrors } from "../../../../utils/formatHelpers";
import { textField } from "../../../../utils/forms/fields";
import translate from "../../../../utils/translations/translate";
import { required, sameValue } from "../../../../utils/validations";
import { PROJECTS_QUERY } from "../../containers/HomeView/queries";
import { GenericForm } from "../GenericForm";
import { REMOVE_PROJECT_MUTATION } from "./queries";
import { IRemoveProject, IRemoveProjectModal } from "./types";

const removeProjectModal: ((props: IRemoveProjectModal) => JSX.Element) =
  (props: IRemoveProjectModal): JSX.Element => {
    const projectName: string = props.projectName.toLowerCase();
    const closeRemoveProjectModal: (() => void) = (): void => { props.onClose(); };
    const removeProjectError: ((error: ApolloError) => void) = (error: ApolloError): void => {
      closeRemoveProjectModal();
      handleGraphQLErrors("An error occurred removing project", error);
    };
    const sameProjectName: ConfigurableValidator = sameValue(projectName);
    const selector: (state: {}, ...fields: string[]) => string = formValueSelector("removeProject");
    const projectNameInput: string = useSelector((state: {}) => selector(state, "projectName"));
    const disableButton: boolean = sameProjectName(projectNameInput);
    const removeProjectResult: ((mtResult: IRemoveProject) => void) = (mtResult: IRemoveProject): void => {
      if (!_.isUndefined(mtResult) && mtResult.removeProject.success) {
        location.assign("/integrates/dashboard#!/home");
        location.reload();
      }
    };

    return (
      <React.StrictMode>
        <Modal
          footer={<div />}
          headerTitle={translate.t("search_findings.tab_resources.removeProject")}
          onClose={closeRemoveProjectModal}
          open={props.isOpen}
        >
          <Mutation
            mutation={REMOVE_PROJECT_MUTATION}
            onCompleted={removeProjectResult}
            onError={removeProjectError}
            refetchQueries={[{ query: PROJECTS_QUERY}]}
          >
            {(removeProject: MutationFn, { loading: submitting }: MutationResult): React.ReactNode => {

              const handleSubmit: ((values: { projectName: string }) => void) =
              (values: { projectName: string }): void => {
                removeProject({ variables: {
                  projectName: values.projectName,
                }})
                .catch();
              };

              return (
                <GenericForm name="removeProject" onSubmit={handleSubmit}>
                  {({ pristine }: InjectedFormProps): JSX.Element => (
                    <React.Fragment>
                      <Row>
                        <Col md={12} sm={12}>
                          <FormGroup>
                            <Trans>
                              <p>{translate.t("search_findings.tab_resources.projectToRemove")}</p>
                            </Trans>
                            <Field
                              component={textField}
                              name="projectName"
                              type="text"
                              validate={[required, sameProjectName]}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <br />
                      <ButtonToolbar className="pull-right">
                        <Button bsStyle="success" onClick={closeRemoveProjectModal}>
                          {translate.t("confirmmodal.cancel")}
                        </Button>
                        <Button bsStyle="success" type="submit" disabled={pristine || submitting || disableButton}>
                          {translate.t("confirmmodal.proceed")}
                        </Button>
                      </ButtonToolbar>
                    </React.Fragment>
                  )}
                </GenericForm>
              );
            }}
          </Mutation>
        </Modal>
      </React.StrictMode>
    );
};

export { removeProjectModal as RemoveProjectModal };
