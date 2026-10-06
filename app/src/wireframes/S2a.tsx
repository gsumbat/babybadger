// GENERATED from wireframe S2a-MonitoringNotice.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14\"></path></svg>"
];

/** Monitoring notice (full) */
export default function WF_S2a() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S2-Consent.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>Monitoring notice</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>The Lee family · v1.0 · Oct 1, 2026</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
          <SvgXml xml={SVG[1]} width={20} height={20} />
        </View>
      </View>
      <View style={{ height: 4, marginRight: 20, marginLeft: 20, backgroundColor: "#E8ECF1", borderRadius: 2, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
        <View style={{ width: "35%", height: 4, backgroundColor: "#47698A", flexDirection: "column" }}>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 14, minHeight: 0, flexGrow: 1, paddingTop: 12, paddingRight: 20, paddingBottom: 8, paddingLeft: 20, overflow: "hidden", flexShrink: 1 }}>
        <View style={{ flexDirection: "column", gap: 6, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 16 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#34526E", letterSpacing: 0.4 }}>IN SHORT</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>The Lee family sees your location only between clock-in and clock-out. Nothing is shared between shifts. You can see and download everything they see.</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 17, color: "#1B2328", marginVertical: -2.62 }}>1. Who is monitoring</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 21 }}>Jen and Sam Lee (“the family”) use BabyBadger to see the location of the person caring for their children. BabyBadger provides the app; the family decides to use it.</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 17, color: "#1B2328", marginVertical: -2.62 }}>2. What is collected</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 21 }}>Your phone’s location, clock-in and clock-out times, trips you start, and entries you add (food, notes, photos).</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 17, color: "#1B2328", marginVertical: -2.62 }}>3. When</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 21 }}>Only from clock-in to clock-out. If you forget to clock out, sharing stops automatically [AUTO-STOP RULE].</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 17, color: "#1B2328", marginVertical: -2.62 }}>4. Why</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 21 }}>So the family knows their children are safe and where they are during pick-ups and outings.</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 17, color: "#1B2328", marginVertical: -2.62 }}>5. Who sees it</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 21 }}>Parents in this family. Not other families, and not BabyBadger staff except for support you ask for.</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 17, color: "#1B2328", marginVertical: -2.62 }}>6. How long it’s kept</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 21 }}>[RETENTION PERIOD], then deleted.</Text>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Scroll to continue · 7. Your choices · 8. Contact</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 6, paddingTop: 6, paddingRight: 20, paddingBottom: 28, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S2-Consent.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>I've read it</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", textAlign: "center" }}>[LEGAL REVIEW] Final wording depends on state law, e.g. employee monitoring notice rules.</Text>
      </View>
    </View>
  );
}
