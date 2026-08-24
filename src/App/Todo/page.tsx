import Headingbar from '../../Components/headingbar/headingbar';
import TodoPage from '../../Components/Todo/page';

function Todo() {
    return (
        <div className="flex flex-col p-2 sm:ml-64">
            <div className="flex flex-col gap-5">
                <Headingbar title="My Tasks" />
            </div>
            <div className="mt-4">
                <TodoPage />
            </div>
        </div>
    );
}

export default Todo;
