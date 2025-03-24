import React from 'react'

const SourceRelationError = ({ sourceRelationErrors }) => {
    return (
        <ul className='error-wrapper'>
            {sourceRelationErrors.map((item, index) => (
                <li key={index} className='error-li'>{item}</li>
            ))}
        </ul>
    )
}

export default SourceRelationError