import { TextEncoder } from "util";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextEncoder = TextEncoder as any;

import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
Enzyme.configure({ adapter: new Adapter() });
