// GENERATED from wireframe S20-ShiftRequest.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l9.5 17h-19z\"></path><path d=\"M12 10v4M12 17.5h0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1B6B3D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Shift request */
export default function WF_S20() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S3-Today.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Shift request</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>
          <View style={{ width: 7, height: 7, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
          </View>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E" }}>New</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 8 }}>
            <View style={{ width: 10, height: 10, backgroundColor: "#2F6FD6", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>The Lee family</Text>
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", marginVertical: -4.83, marginTop: 4 }}>Sat, Oct 3</Text>
          <Text style={{ fontFamily: font.displayBold, fontSize: 20, color: "#4B5960" }}>6:00 – 11:00 PM · 5 hrs</Text>
          <View style={{ flexDirection: "column", marginTop: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 46, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
              <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Kids</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", textAlign: "right", flexShrink: 1 }}>Ava 7, Leo 4</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 46, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
              <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Plan</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", textAlign: "right", flexShrink: 1 }}>Dinner, bath, bedtime</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 46 }}>
              <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Pay</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", textAlign: "right", flexShrink: 1 }}>[RATE] / hr</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 14, paddingBottom: 14, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 16 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <SvgXml xml={SVG[1]} width={22} height={22} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#7A4E0E", lineHeight: 20 }}>Overlaps your time off, 7:00 – 10:00 PM.</Text> The family only saw "unavailable".</Text>
          </View>
          <View style={{ flexDirection: "row", height: 30, borderRadius: 8, overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", flexGrow: 1, backgroundColor: "#DCE8FA", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#1F4E9A" }}>6</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", flexGrow: 3, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#7A4E0E" }}>You're off 7–10</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", flexGrow: 1, backgroundColor: "#DCE8FA", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#1F4E9A" }}>11</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 14 }}>YOUR ANSWER</Text>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 2.0, borderColor: "#47698A", ...cardShadow }}>{/* -> S3-Today.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[2]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Offer 6:00 – 7:00 PM only</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>The family can accept or look elsewhere</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>{/* -> S3-Today.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCEEE3", borderRadius: 14 }}>
              <SvgXml xml={SVG[3]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Accept all and cancel my time off</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Books the full 5 hours</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{ paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20, flexDirection: "column" }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>{/* -> S3-Today.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328" }}>Decline</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S3-Today.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Send answer</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
