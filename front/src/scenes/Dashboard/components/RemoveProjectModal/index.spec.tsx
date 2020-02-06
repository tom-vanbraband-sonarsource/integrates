import { configure, mount, ReactWrapper } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
// tslint:disable-next-line: no-import-side-effect
import "isomorphic-fetch";
import React from "react";
// tslint:disable-next-line: no-submodule-imports
import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
// tslint:disable-next-line: no-submodule-imports
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import wait from "waait";
import store from "../../../../store";
import { PROJECTS_QUERY } from "../../containers/HomeView/queries";
import { RemoveProjectModal } from "./index";
import { REQUEST_REMOVE_PROJECT_MUTATION } from "./queries";
import { IRemoveProject } from "./types";

configure({ adapter: new ReactSixteenAdapter() });

describe("RemoveProjectModal component", () => {
  it("should render remove project modal", () => {
    const handleOnClose: jest.Mock = jest.fn();
    const projectName: IRemoveProject = {
      requestRemoveProject: {
        success: true,
      },
    };
    const mocksMutation: MockedResponse[] = [{
        request: {
          query: REQUEST_REMOVE_PROJECT_MUTATION,
        },
        result: {
          data: { projectName },
        },
      }];
    const wrapper: ReactWrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={mocksMutation} addTypename={false}>
          <RemoveProjectModal
            isOpen={true}
            onClose={handleOnClose}
            projectName={""}
          />
        </MockedProvider>
      </Provider>,
    );

    const cancelButton: ReactWrapper = wrapper
      .find("Button")
      .filterWhere((element: ReactWrapper) => element.contains("Cancel"));
    cancelButton.simulate("click");
    expect(wrapper)
      .toHaveLength(1);
    expect(handleOnClose.mock.calls.length)
      .toEqual(1);
  });

  it("should render project modal and submit", async () => {
    const handleOnClose: jest.Mock = jest.fn();
    const mocksMutation: MockedResponse[] = [
      {
        request: {
          query: REQUEST_REMOVE_PROJECT_MUTATION,
          variables: {projectName: "test"},
        },
        result: jest.fn(() => ({
          data: { requestRemoveProject: { success: true }},
        })),
      },
      {
        request: {
          query: PROJECTS_QUERY,
          variables: {},
        },
        result: {
          data: { me: { projects: [] }},
        },
      }];
    const wrapper: ReactWrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={mocksMutation} addTypename={false}>
          <RemoveProjectModal
            isOpen={true}
            onClose={handleOnClose}
            projectName={"test"}
          />
        </MockedProvider>
      </Provider>,
    );
    const projectName: ReactWrapper = wrapper.find("input[value=\"\"]");
    projectName.simulate("change", { target: { value: "test" } });
    const form: ReactWrapper = wrapper.find("genericForm");
    form.simulate("submit");
    const { result }: MockedResponse = mocksMutation[0];

    await act(async () => { await wait(0); expect(result)
      .toHaveBeenCalled(); });
    expect(wrapper)
      .toHaveLength(1);
  });
});
