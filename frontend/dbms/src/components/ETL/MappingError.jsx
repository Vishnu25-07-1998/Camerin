import './errorContainer.css';

const MappingError = ({ mappingErrors }) => {
    return (
        <ul className='error-wrapper'>
            {mappingErrors.map((item, index) => (
                <li key={index} className='error-li'>{item}</li>
            ))}
        </ul>
    )
}

export default MappingError