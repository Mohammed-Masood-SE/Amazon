import styles from "../../styles/Grid.module.css";

function Grid({ children }) {
  return <div className={styles.Grid}>{children}</div>;
}

export default Grid;
