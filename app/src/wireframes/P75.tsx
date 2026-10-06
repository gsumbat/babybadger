// GENERATED from wireframe P75-AddRules.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>"
];

/** Add house rules */
export default function WF_P75() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P74-HouseRules.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>Add rules</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Most chosen by parents</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 24, minHeight: 0, flexGrow: 1, paddingTop: 2, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>UPDATES AND LOGS</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
              <SvgXml xml={SVG[1]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Meals and snacks</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
              <SvgXml xml={SVG[2]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Naps and sleep</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
              <SvgXml xml={SVG[3]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Activities</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
              <SvgXml xml={SVG[4]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Photo updates</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[5]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Diapers and potty</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>PHONE AND SCREENS</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
              <SvgXml xml={SVG[6]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Phone for emergencies only</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
              <SvgXml xml={SVG[7]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>No social media</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
              <SvgXml xml={SVG[8]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Screen time limit</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[9]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>No screens at meals</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[10]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>No phone while driving</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>SAFETY</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
              <SvgXml xml={SVG[11]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>No visitors</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
              <SvgXml xml={SVG[12]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Ask before leaving home</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[13]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Never alone in bath or pool</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[14]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Doors locked</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>FOOD AND ROUTINE</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[15]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Only food from the meal plan</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[16]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>No sweets after 5 PM</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[17]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Bedtime as written</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>HOME AND CONDUCT</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
              <SvgXml xml={SVG[18]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Tidy before you go</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[19]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Gentle discipline, no yelling</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[20]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>No smoking or vaping</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
              <SvgXml xml={SVG[21]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Speak Spanish with the kids</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 46, flexShrink: 0, borderRadius: 999, borderWidth: 2.0, borderColor: "#C9D3DD", borderStyle: "dashed" }}>{/* -> P76-RuleDetail.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>+ Write your own rule</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 26, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P74-HouseRules.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Add 3 rules</Text>
        </View>
      </View>
    </View>
  );
}
