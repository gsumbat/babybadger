// GENERATED from wireframe P40-PaymentIssue.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l9.5 17h-19z\"></path><path d=\"M12 10v4M12 17.5h0\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #A1321F; stroke-width: 2.4; stroke-linecap: round\"><path d=\"M6 6l12 12M18 6L6 18\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #A1321F; stroke-width: 2.4; stroke-linecap: round\"><path d=\"M6 6l12 12M18 6L6 18\"></path></svg>"
];

/** Payment issue */
export default function WF_P40() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", flexShrink: 1 }}>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Monday morning</Text>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328" }}>The Lee family</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#1B2328", borderRadius: 22, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#FFFFFF" }}>JL</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 8, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#F6E3C6", borderRadius: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <SvgXml xml={SVG[0]} width={22} height={22} />
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#7A4E0E", flexShrink: 1 }}>Payment didn’t go through</Text>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>Everything keeps working until <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>Fri, Nov 20</Text> while we retry your card. Update your card to avoid a pause.</Text>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P39-Subscription.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Update payment</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>IF YOUR PLAN PAUSES</Text>
        <View style={{ flexDirection: "column", paddingTop: 8, paddingRight: 16, paddingBottom: 8, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ paddingTop: 4 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B6B3D" }}>Still works, always</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 34 }}>
            <SvgXml xml={SVG[1]} width={18} height={18} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Kid Help button alerts</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 34 }}>
            <SvgXml xml={SVG[2]} width={18} height={18} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Messages with your sitter</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 34 }}>
            <SvgXml xml={SVG[3]} width={18} height={18} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Past reports and receipts</Text>
          </View>
          <View style={{ height: 1, marginTop: 6, marginBottom: 6, backgroundColor: "#E8ECF1", flexDirection: "column" }}>
          </View>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#A1321F" }}>Paused</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 34 }}>
            <SvgXml xml={SVG[4]} width={18} height={18} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Live map and trips</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 34 }}>
            <SvgXml xml={SVG[5]} width={18} height={18} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>New bookings and care plan edits</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17 }}>Your family, kids and sitters are kept for 12 months. Resubscribe anytime to pick up where you left off.</Text>
      </View>
    </View>
  );
}
