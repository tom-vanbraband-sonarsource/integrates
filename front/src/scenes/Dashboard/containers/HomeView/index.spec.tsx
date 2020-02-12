import { MockedProvider, MockedResponse } from "@apollo/react-testing";
import { configure, mount, ReactWrapper } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
import { GraphQLError } from "graphql";
// tslint:disable-next-line: no-import-side-effect
import "isomorphic-fetch";
import * as React from "react";
import { Provider } from "react-redux";
import store from "../../../../store/index";
import { HomeView } from "./index";
import { PROJECTS_QUERY } from "./queries";
import { IHomeViewProps } from "./types";

configure({ adapter: new ReactSixteenAdapter() });

describe("HomeView", () => {

  const mockProps: IHomeViewProps = {
    history: {
      action: "PUSH",
      block: (): (() => void) => (): void => undefined,
      createHref: (): string => "",
      go: (): void => undefined,
      goBack: (): void => undefined,
      goForward: (): void => undefined,
      length: 1,
      listen: (): (() => void) => (): void => undefined,
      location: {
        hash: "",
        pathname: "/",
        search: "",
        state: {},
      },
      push: (): void => undefined,
      replace: (): void => undefined,
    },
    location: {
      hash: "",
      pathname: "/",
      search: "",
      state: {},
    },
    match: {
      isExact: true,
      params: { projectName: "TEST" },
      path: "/",
      url: "",
    },
  };

  const mocks: ReadonlyArray<MockedResponse> = [
    {
      request: {
        query: PROJECTS_QUERY,
      },
      result: {
        data: {
          me: {
            __typename: "Me",
            projects: [{
              __typename: "Project",
              description: "Project description",
              name: "TEST",
            }],
          },
        },
      },
    }];

  const mockError: ReadonlyArray<MockedResponse> = [
    {
      request: {
        query: PROJECTS_QUERY,
      },
      result: {
        errors: [new GraphQLError("Access denied")],
      },
    }];

  it("should return an object", () => {
    expect(typeof (HomeView))
      .toEqual("function");
  });

  it("should render an error in component", () => {
    const wrapper: ReactWrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={mockError} addTypename={true}>
          <HomeView {...mockProps} />
        </MockedProvider>
      </Provider>,
    );
    expect(wrapper)
      .toHaveLength(1);
  });

  it("should render a component", () => {
    const wrapper: ReactWrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <HomeView {...mockProps} />
        </MockedProvider>
      </Provider>,
    );
    expect(wrapper)
      .toHaveLength(1);
  });
  it("should render a component with new project button", () => {
    (window as typeof window & { userRole: string }).userRole = "admin";
    const wrapper: ReactWrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <HomeView {...mockProps} />
        </MockedProvider>
      </Provider>,
    );
    const displayList: ReactWrapper = wrapper.find("input[value=\"list\"]");
    displayList.simulate("change", { target: { checked: true } });
    const projectButton: ReactWrapper = wrapper
      .find("Button")
      .filterWhere((element: ReactWrapper) => element.contains("New Project"));
    projectButton.simulate("click");
    expect(projectButton)
      .toHaveLength(1);
    expect(wrapper)
      .toHaveLength(1);
  });
});
