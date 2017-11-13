import DevRoom from './dev-room';
import { renderApplication } from './renderer';



it('renders without crashing', () => {
  const div = document.createElement('div');
  renderApplication(DevRoom, div);
});
