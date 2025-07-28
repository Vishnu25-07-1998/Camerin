import styles from './modal.module.css';

const ProcessingModal = () => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.processingModal}>
                <p className={styles.processingText}>Processing</p>
                <div className="animate-bar">
                    <span className='dots'></span>
                    <span className='dots'></span>
                    <span className='dots'></span>
                </div>
            </div>
        </div>
    )
}

export default ProcessingModal