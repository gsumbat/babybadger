import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { photoUrl } from '@/lib/data';
import { timeOf } from '@/lib/format';
import { describeLog } from '@/lib/shift-logic';
import type { Kid, LogEntry, LogKind } from '@/lib/types';
import { color } from '@/theme';

import { Icon, type IconName, T } from './ui';

const ICON: Record<LogKind, { icon: IconName; bg: string; fg: string }> = {
  food: { icon: 'coffee', bg: color.warnTint, fg: color.warnInk },
  nap: { icon: 'moon', bg: '#ECE7F5', fg: '#6A5A9E' },
  activity: { icon: 'play-circle', bg: color.primaryTint, fg: color.primary },
  diaper: { icon: 'droplet', bg: color.primaryTint, fg: color.primary },
  note: { icon: 'file-text', bg: color.muted, fg: color.ink2 },
  photo: { icon: 'camera', bg: color.accentTint, fg: '#8A5A7A' },
};

export function LogTimeline({ logs, kids, compact }: { logs: LogEntry[]; kids: Kid[]; compact?: boolean }) {
  if (!logs.length) return <T variant="muted">Nothing logged yet.</T>;
  const kidNames = (ids: string[]) =>
    ids.length === 0 || (kids.length > 1 && ids.length === kids.length) ? (kids.length > 1 ? 'Both' : '') : ids.map((id) => kids.find((k) => k.id === id)?.name).filter(Boolean).join(', ');
  if (compact)
    // Report style (wireframe P5): time on the left, one line per entry.
    return (
      <View style={{ gap: 6 }}>
        {[...logs].reverse().map((l) => {
          const d = describeLog(l);
          const who = kidNames(l.kid_ids);
          return (
            <View key={l.id} style={{ flexDirection: 'row', gap: 12 }}>
              <T variant="muted" style={{ width: 64 }}>
                {timeOf(l.happened_at).replace(/\s?[AP]M$/i, '')}
              </T>
              <T style={{ flex: 1, color: l.urgent ? color.badInk : color.ink }}>
                {[d.title, who, d.detail].filter(Boolean).join(' · ')}
              </T>
            </View>
          );
        })}
      </View>
    );
  return (
    <View style={{ gap: 12 }}>
      {logs.map((l) => {
        const d = describeLog(l);
        const ic = ICON[l.kind];
        const who = kidNames(l.kid_ids);
        return (
          <View key={l.id} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: ic.bg, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={ic.icon} size={18} tint={ic.fg} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <T variant="strong">
                  {d.title}
                  {who ? ` · ${who}` : ''}
                  {l.urgent ? ' · needs attention' : ''}
                </T>
                <T variant="small">{timeOf(l.happened_at)}</T>
              </View>
              {d.detail ? <T variant="muted">{d.detail}</T> : null}
              {l.photo_path ? <Photo path={l.photo_path} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** A shift photo from private storage (signed link). */
export function PhotoThumb({ path, height = 64, style }: { path: string; height?: number; style?: object }) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    photoUrl(path).then(setUri);
  }, [path]);
  return <View style={[{ height, borderRadius: 10, overflow: 'hidden', backgroundColor: color.accentTint }, style]}>{uri ? <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" /> : null}</View>;
}

function Photo({ path }: { path: string }) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    photoUrl(path).then(setUri);
  }, [path]);
  return <View style={{ width: 160, height: 110, borderRadius: 12, overflow: 'hidden', backgroundColor: color.accentTint, marginTop: 4 }}>{uri ? <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" /> : null}</View>;
}
