import { configure, shallow, ShallowWrapper } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
import React from "react";
import { BreadcrumbItem } from "react-bootstrap";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { navbarComponent as NavbarComponent } from "./index";

configure({ adapter: new ReactSixteenAdapter() });

describe("Navbar", () => {

  it("should return a function", () => {
    expect(typeof (NavbarComponent))
      .toEqual("function");
  });

  it("should render", () => {
    const mockProps: RouteComponentProps = {
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
        pathname: "/home",
        search: "",
        state: {
          userInfo: {
            givenName: "Test",
          },
        },
      },
      match: {
        isExact: true,
        params: {},
        path: "/home",
        url: "",
      },
    };
    const wrapper: ShallowWrapper = shallow(
      <NavbarComponent {...mockProps}/>,
    );
    expect(wrapper.contains(
      <BreadcrumbItem active={false}>
        <Link to="/home">
          <b>
            My Projects
          </b>
        </Link>
      </BreadcrumbItem>,
    ))
      .toBeTruthy();
  });
});
