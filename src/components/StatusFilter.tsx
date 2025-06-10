import { useSelector } from 'react-redux';
import { selectAllStatuses } from '/src/store/index.ts';

const StatusFilter = () => {
    const statuses = useSelector(selectAllStatuses);

    console.log('Statuses:', statuses);

    return (
        <div>
            <h3>Filter by Status</h3>
            {statuses.map((status) => (
                <div key={status}>
                    <label>
                        <input type="checkbox" value={status} />
                        {status}
                    </label>
                </div>
            ))}
        </div>
    );
};

export default StatusFilter;