import { formatSkillSchedule } from '../utils/helpers';

export default function SkillCard({
  skill,
  onReserve,
  reserved = false,
  onDelete,
  onEdit
}) {

  const currentStudents = skill.currentStudents || 0;
  const maxStudents = skill.maxStudents || 1;

  const isFull = currentStudents >= maxStudents;

  return (
    <article className="skill-card">

      <div className="card-top">
        <span className="tag">
          {skill.category}
        </span>

        <span className="coin">
          ◉ {skill.price}
        </span>
      </div>

      <h3>{skill.title}</h3>

      <p className="muted">
        {skill.subject}
      </p>

      <p>{skill.description}</p>

      <div className="available">
  📅 {formatSkillSchedule(skill)}
</div>

      <div className="students">
        👥 {currentStudents} / {maxStudents}人予約済み
      </div>

      <footer>

        <span>
          by {skill.sellerName}
        </span>

        <div
          style={{
            display: 'flex',
            gap: '8px'
          }}
        >

          {onEdit ? <button onClick={() => onEdit(skill)}>編集</button> : onReserve && (
            <button
              disabled={
                reserved || isFull
              }
              onClick={() =>
                onReserve(skill)
              }
            >
              {reserved
                ? '予約済み'
                : isFull
                  ? '満員'
                  : '予約する'}
            </button>
          )}

          {onDelete && (
            <button
              style={{
                background: '#ef4444',
                color: 'white'
              }}
              onClick={() =>
                onDelete(skill.id)
              }
            >
              削除
            </button>
          )}

        </div>

      </footer>

    </article>
  );

}
