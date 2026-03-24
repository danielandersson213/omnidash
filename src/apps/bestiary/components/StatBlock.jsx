import styles from './StatBlock.module.css'

/* ── Helpers ────────────────────────────── */

function mod(score) {
  const m = Math.floor((score - 10) / 2)
  return (m >= 0 ? '+' : '') + m
}

function formatCR(cr) {
  if (cr === 0.125) return '⅛'
  if (cr === 0.25)  return '¼'
  if (cr === 0.5)   return '½'
  return String(cr)
}

function formatSpeed(speed) {
  return Object.entries(speed)
    .filter(([, v]) => v && v !== '0 ft.')
    .map(([k, v]) => (k === 'walk' ? v : `${k} ${v}`))
    .join(', ')
}

function formatAC(acArr) {
  return acArr
    .map(a =>
      a.type === 'dex' || a.type === 'flat'
        ? String(a.value)
        : `${a.value} (${a.type.replace(/_/g, ' ')})`
    )
    .join(' / ')
}

function formatSenses(senses) {
  const parts = []
  if (senses.blindsight)  parts.push(`Blindsight ${senses.blindsight}`)
  if (senses.darkvision)  parts.push(`Darkvision ${senses.darkvision}`)
  if (senses.tremorsense) parts.push(`Tremorsense ${senses.tremorsense}`)
  if (senses.truesight)   parts.push(`Truesight ${senses.truesight}`)
  parts.push(`Passive Perception ${senses.passive_perception}`)
  return parts.join(', ')
}

const TYPE_GLYPH = {
  aberration:  '◈', beast:      '◆', celestial:  '✦',
  construct:   '⬡', dragon:     '◈', elemental:  '◇',
  fey:         '✿', fiend:      '▲', giant:      '▣',
  humanoid:   '◉', monstrosity: '✸', ooze:       '○',
  plant:       '❋', undead:     '☽',
}

/* ── Loading skeleton ───────────────────── */

function Skeleton() {
  return (
    <div className={styles.skeleton}>
      {[80, 50, 100, 60, 40, 90, 70].map((w, i) => (
        <div key={i} className={styles.skeletonLine} style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

/* ── Main component ─────────────────────── */

export default function StatBlock({ monster, loading }) {
  if (loading) return <Skeleton />
  if (!monster) return (
    <div className={styles.empty}>
      <span className={styles.emptyGlyph}>⚔</span>
      <p>Select a creature from the list</p>
    </div>
  )

  const {
    name, size, type, subtype, alignment,
    armor_class, hit_points, hit_points_roll, speed,
    strength, dexterity, constitution, intelligence, wisdom, charisma,
    proficiencies, damage_vulnerabilities, damage_resistances,
    damage_immunities, condition_immunities, senses, languages,
    challenge_rating, xp,
    special_abilities, actions, legendary_actions, reactions,
  } = monster

  const saves = proficiencies
    .filter(p => p.proficiency.name.startsWith('Saving Throw:'))
    .map(p => `${p.proficiency.name.replace('Saving Throw: ', '')} ${p.value >= 0 ? '+' : ''}${p.value}`)
    .join(', ')

  const skillsList = proficiencies
    .filter(p => p.proficiency.name.startsWith('Skill:'))
    .map(p => `${p.proficiency.name.replace('Skill: ', '')} ${p.value >= 0 ? '+' : ''}${p.value}`)
    .join(', ')

  const typeStr = [size, subtype ? `${type} (${subtype})` : type, alignment]
    .filter(Boolean).join(', ')

  const glyph = TYPE_GLYPH[type] ?? '◆'

  return (
    <div className={styles.block}>
      {/* Top row: stat info left, image right */}
      <div className={styles.topSection}>
        <div className={styles.statContent}>
          {!monster.image && <div className={styles.bgGlyph} aria-hidden>{glyph}</div>}

          <div className={styles.header}>
            <h2 className={styles.name}>{name}</h2>
            <p className={styles.typeStr}>{typeStr}</p>
          </div>

          <div className={styles.rule} />

          <div className={styles.basics}>
            <div className={styles.basicRow}>
              <span className={styles.label}>Armor Class</span>
              <span>{formatAC(armor_class)}</span>
            </div>
            <div className={styles.basicRow}>
              <span className={styles.label}>Hit Points</span>
              <span>{hit_points} ({hit_points_roll})</span>
            </div>
            <div className={styles.basicRow}>
              <span className={styles.label}>Speed</span>
              <span>{formatSpeed(speed)}</span>
            </div>
          </div>

          <div className={styles.rule} />

          <div className={styles.abilities}>
            {[
              ['STR', strength],
              ['DEX', dexterity],
              ['CON', constitution],
              ['INT', intelligence],
              ['WIS', wisdom],
              ['CHA', charisma],
            ].map(([abbr, score]) => (
              <div key={abbr} className={styles.ability}>
                <div className={styles.abilityLabel}>{abbr}</div>
                <div className={styles.abilityScore}>{score}</div>
                <div className={styles.abilityMod}>{mod(score)}</div>
              </div>
            ))}
          </div>

          <div className={styles.rule} />

          <div className={styles.props}>
            {saves && (
              <div className={styles.propRow}>
                <span className={styles.label}>Saving Throws</span> {saves}
              </div>
            )}
            {skillsList && (
              <div className={styles.propRow}>
                <span className={styles.label}>Skills</span> {skillsList}
              </div>
            )}
            {damage_vulnerabilities.length > 0 && (
              <div className={styles.propRow}>
                <span className={styles.label}>Vulnerabilities</span> {damage_vulnerabilities.join(', ')}
              </div>
            )}
            {damage_resistances.length > 0 && (
              <div className={styles.propRow}>
                <span className={styles.label}>Resistances</span> {damage_resistances.join(', ')}
              </div>
            )}
            {damage_immunities.length > 0 && (
              <div className={styles.propRow}>
                <span className={styles.label}>Damage Immunities</span> {damage_immunities.join(', ')}
              </div>
            )}
            {condition_immunities.length > 0 && (
              <div className={styles.propRow}>
                <span className={styles.label}>Condition Immunities</span>{' '}
                {condition_immunities.map(c => c.name).join(', ')}
              </div>
            )}
            <div className={styles.propRow}>
              <span className={styles.label}>Senses</span> {formatSenses(senses)}
            </div>
            {languages && (
              <div className={styles.propRow}>
                <span className={styles.label}>Languages</span> {languages}
              </div>
            )}
            <div className={styles.propRow}>
              <span className={styles.label}>Challenge</span>{' '}
              <span className={styles.crBadge}>{formatCR(challenge_rating)}</span>
              {xp != null && (
                <span className={styles.xp}> ({xp.toLocaleString()} XP)</span>
              )}
            </div>
          </div>
        </div>

        {monster.image && (
          <div className={styles.imageWrap}>
            <img
              src={`/dnd${monster.image}`}
              alt={name}
              className={styles.image}
              onError={e => { e.currentTarget.parentElement.style.display = 'none' }}
            />
          </div>
        )}
      </div>

      {/* Special abilities */}
      {special_abilities?.length > 0 && (
        <>
          <div className={styles.rule} />
          <div className={styles.features}>
            {special_abilities.map((a, i) => (
              <p key={i} className={styles.feature}>
                <em className={styles.featureName}>{a.name}.</em>{' '}{a.desc}
              </p>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      {actions?.length > 0 && (
        <>
          <div className={styles.rule} />
          <div className={styles.sectionTitle}>Actions</div>
          <div className={styles.features}>
            {actions.map((a, i) => (
              <p key={i} className={styles.feature}>
                <em className={styles.featureName}>{a.name}.</em>{' '}{a.desc}
              </p>
            ))}
          </div>
        </>
      )}

      {/* Reactions */}
      {reactions?.length > 0 && (
        <>
          <div className={styles.rule} />
          <div className={styles.sectionTitle}>Reactions</div>
          <div className={styles.features}>
            {reactions.map((a, i) => (
              <p key={i} className={styles.feature}>
                <em className={styles.featureName}>{a.name}.</em>{' '}{a.desc}
              </p>
            ))}
          </div>
        </>
      )}

      {/* Legendary actions */}
      {legendary_actions?.length > 0 && (
        <>
          <div className={styles.rule} />
          <div className={styles.sectionTitle}>Legendary Actions</div>
          <div className={styles.features}>
            {legendary_actions.map((a, i) => (
              <p key={i} className={styles.feature}>
                <em className={styles.featureName}>{a.name}.</em>{' '}{a.desc}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
