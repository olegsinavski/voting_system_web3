
/**
 * Spinner component renders a loading spinner.
 */
export default function Spinner({loading}) {
    return (
        <div>
            {loading && (
            <div className="loader_overlay">
                <div className="loader_container">
                <div className="loader"></div>
                </div>
            </div>)}
        </div>
    );
}
