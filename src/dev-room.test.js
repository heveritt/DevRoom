import DevRoom from './dev-room';
import { render } from './renderer';

it('renders without crashing', () => {
    const div = document.createElement('div');
    render.application(DevRoom, div);
});
