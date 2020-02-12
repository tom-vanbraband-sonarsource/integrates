/* tslint:disable:jsx-no-multiline-js
 *
 * NO-MULTILINE-JS: Disabling this rule is necessary for the sake of
  * readability of the code that defines the headers of the table
 */
import { ApolloConsumer } from "@apollo/react-common";
import { ApolloClient, ApolloError, ApolloQueryResult } from "apollo-client";
import { GraphQLError } from "graphql";
import _ from "lodash";
import React from "react";
import { ButtonToolbar, Col, ControlLabel, FormGroup, Row } from "react-bootstrap";
import { Field, formValueSelector, InjectedFormProps } from "redux-form";
import { Button } from "../../../../../components/Button/index";
import { Modal } from "../../../../../components/Modal/index";
import store from "../../../../../store/index";
import { handleErrors } from "../../../../../utils/formatHelpers";
import { dropdownField, phoneNumberField, textField } from "../../../../../utils/forms/fields";
import { msgError } from "../../../../../utils/notifications";
import translate from "../../../../../utils/translations/translate";
import { required, validEmail } from "../../../../../utils/validations";
import { GenericForm } from "../../../components/GenericForm/index";
import { GET_USERS } from "./queries";
import { IAddUserModalProps, IUserDataAttr } from "./types";

const renderManagerRoles: JSX.Element = (
  <React.Fragment>
    <option value="customer">{translate.t("search_findings.tab_users.customer")}</option>
    <option value="customeradmin">{translate.t("search_findings.tab_users.customer_admin")}</option>
  </React.Fragment>
);

const renderAllRoles: JSX.Element = (
  <React.Fragment>
    <option value="analyst">{translate.t("search_findings.tab_users.analyst")}</option>
    <option value="admin">{translate.t("search_findings.tab_users.admin")}</option>
    {renderManagerRoles}
  </React.Fragment>
);

const requiredIndicator: JSX.Element = <label style={{ color: "#f22"}}>* </label>;

const loadAutofillData: (
  (props: IAddUserModalProps, client: ApolloClient<{}>, change: InjectedFormProps["change"]) => void) =
  (props: IAddUserModalProps, client: ApolloClient<{}>, change: InjectedFormProps["change"]): void => {
    /* tslint:disable-next-line no-any
    * Disabling here is necessary since forms are
    * a generic component and their fields may differ
    */
    const fieldSelector: ((stateTree: {}, ...fields: string[]) => any) = formValueSelector("addUser");
    const email: string = fieldSelector(store.getState(), "email");
    if (!_.isEmpty(email)) {
      client.query({
        query: GET_USERS,
        variables: { projectName: props.projectName !== undefined ? props.projectName : "-", userEmail: email },
      })
      .then(({ data, errors }: ApolloQueryResult<IUserDataAttr>) => {

        if (!_.isUndefined(errors)) {
          handleErrors("An error occurred getting user information for autofill", errors);
        }
        if (!_.isUndefined(data)) {
          change("organization", data.user.organization);
          change("phoneNumber", data.user.phoneNumber);
          change("responsibility", data.user.responsibility);
        }
      })
      .catch((errors: ApolloError) => {
        errors.graphQLErrors.forEach(({ message }: GraphQLError): void => {
          if (message !== "Exception - User not Found") {
            msgError("An error occurred getting user information for autofill");
          }
        });
      });
    }
  };

const renderFormContent: ((props: IAddUserModalProps) => JSX.Element) =
  (props: IAddUserModalProps): JSX.Element => {
    const handleProceedClick: ((values: {}) => void) = (values: {}): void => { props.onSubmit(values); };
    const handleCancelClick: (() => void) = (): void => { props.onClose(); };

    return (
      <GenericForm name="addUser" initialValues={props.initialValues} onSubmit={handleProceedClick}>
        {({ change }: InjectedFormProps): React.ReactNode => (
        <Row>
          <Col md={12} sm={12}>
          <FormGroup>
            <ControlLabel>{requiredIndicator}{translate.t("search_findings.tab_users.textbox")}</ControlLabel>
            <ApolloConsumer>
              {(client: ApolloClient<{}>): JSX.Element => (
                <Field
                  name="email"
                  component={textField}
                  type="text"
                  placeholder={translate.t("search_findings.tab_users.email")}
                  validate={[required, validEmail]}
                  disabled={props.type === "edit"}
                  /* tslint:disable-next-line jsx-no-lambda
                  * Disabling this rule is necessary for the sake of simplicity and
                  * readability of the code that binds component events
                  */
                  onBlur={(): void => { loadAutofillData(props, client, change); }}
                />
              )}
            </ApolloConsumer>
          </FormGroup>
          <FormGroup>
            <ControlLabel>
              {requiredIndicator}
              {translate.t("search_findings.tab_users.user_organization")}
            </ControlLabel>
            <Field name="organization" component={textField} type="text" validate={[required]}/>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{requiredIndicator}{translate.t("search_findings.tab_users.role")}</ControlLabel>
            <Field name="role" component={dropdownField} validate={[required]}>
              <option value="" selected={true}/>
              {props.userRole === "admin" ? renderAllRoles : undefined}
              {props.userRole === "customeradmin" ? renderManagerRoles : undefined}
            </Field>
          </FormGroup>
          {props.projectName !== undefined ?
            <FormGroup>
              <ControlLabel>
                {requiredIndicator}
                {translate.t("search_findings.tab_users.user_responsibility")}
              </ControlLabel>
              <Field
                name="responsibility"
                component={textField}
                type="text"
                placeholder={translate.t("search_findings.tab_users.responsibility_placeholder")}
                validate={[required]}
              />
            </FormGroup>
          : undefined}
          <FormGroup>
            <ControlLabel>{requiredIndicator}{translate.t("search_findings.tab_users.phone_number")}</ControlLabel>
            <Field name="phoneNumber" component={phoneNumberField} type="text" validate={[required]}/>
          </FormGroup>
          </Col>
          <Col md={12} sm={12}>
            <ButtonToolbar className="pull-right">
              <Button bsStyle="default" onClick={handleCancelClick}>{translate.t("confirmmodal.cancel")}</Button>
              <Button bsStyle="primary" type="submit">{translate.t("confirmmodal.proceed")}</Button>
            </ButtonToolbar>
          </Col>
        </Row>
        )}
      </GenericForm>
    );
  };

export const addUserModal: ((props: IAddUserModalProps) => JSX.Element) = (props: IAddUserModalProps): JSX.Element => {
  let title: string = props.type === "add"
  ? translate.t("search_findings.tab_users.title")
  : translate.t("search_findings.tab_users.edit_user_title");
  title = props.projectName === undefined ? translate.t("sidebar.user") : title;

  return (
    <React.StrictMode>
      <Modal
        open={props.open}
        headerTitle={title}
        content={renderFormContent(props)}
        footer={<div />}
      />
    </React.StrictMode>
  );
  };
