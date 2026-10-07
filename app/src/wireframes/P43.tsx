// GENERATED from wireframe P43-PoolWeek.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Who's free this week */
export default function WF_P43() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P42-Pool.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>Who's free</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Your pool · Oct 5 – 11</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8, flexShrink: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P43-PoolWeek.dc.html */}
            <SvgXml xml={SVG[1]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P43-PoolWeek.dc.html */}
            <SvgXml xml={SVG[2]} width={18} height={18} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 10, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Mornings</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Afternoons</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#FFFFFF", borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Evenings</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 12, paddingBottom: 14, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", gap: 5 }}>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Mon</Text>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>5</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Tue</Text>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>6</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Wed</Text>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>7</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Thu</Text>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>8</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Fri</Text>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>9</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#47698A" }}>Sat</Text>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>10</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "column", alignItems: "center", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Sun</Text>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>11</Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
            </View>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 5 }}>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 26, height: 26, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 13 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 11, color: "#FFFFFF" }}>M</Text>
                </View>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Maya</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[3]} width={16} height={16} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#E8ECF1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[4]} width={16} height={16} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[5]} width={16} height={16} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[6]} width={16} height={16} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>
                <SvgXml xml={SVG[7]} width={16} height={16} />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[8]} width={16} height={16} />
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
            </View>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 5 }}>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 26, height: 26, flexShrink: 0, backgroundColor: "#5E7F6A", borderRadius: 13 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 11, color: "#FFFFFF" }}>P</Text>
                </View>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Priya</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[9]} width={16} height={16} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[10]} width={16} height={16} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#E8ECF1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#E8ECF1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 10, color: "#34526E", flexShrink: 1 }}>½</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>
                <SvgXml xml={SVG[11]} width={16} height={16} />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[12]} width={16} height={16} />
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
            </View>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 5 }}>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 26, height: 26, flexShrink: 0, backgroundColor: "#8A6A4E", borderRadius: 13 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 11, color: "#FFFFFF" }}>J</Text>
                </View>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Jordan</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 10, color: "#34526E", flexShrink: 1 }}>½</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[13]} width={16} height={16} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[14]} width={16} height={16} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[15]} width={16} height={16} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#E8ECF1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 10, color: "#34526E", flexShrink: 1 }}>½</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#E8ECF1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
            </View>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 5 }}>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 26, height: 26, flexShrink: 0, backgroundColor: "#6F6194", borderRadius: 13 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 11, color: "#FFFFFF" }}>S</Text>
                </View>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Sofia</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#E8ECF1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#E8ECF1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[16]} width={16} height={16} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#E8ECF1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#E8ECF1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#E8ECF1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <SvgXml xml={SVG[17]} width={16} height={16} />
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
            </View>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 5 }}>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 26, height: 26, flexShrink: 0, backgroundColor: "#5F6D74", borderRadius: 13 }}>
                  <Text style={{ fontFamily: font.displayBold, fontSize: 11, color: "#FFFFFF" }}>D</Text>
                </View>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Dana</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
              <View style={{ flex: 1 }} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 18, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 14, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
                <SvgXml xml={SVG[18]} width={16} height={16} />
              </View>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Free</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 18, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 14, borderRadius: 10 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 10, color: "#34526E", flexShrink: 1 }}>½</Text>
              </View>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Part of it</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 18, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 14, backgroundColor: "#E8ECF1", borderRadius: 10 }}>
                <View style={{ width: 10, height: 2, backgroundColor: "#9AA6B2", borderRadius: 1, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Busy</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 18, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 14, borderRadius: 10 }}>
              </View>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Away</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 14, paddingBottom: 14, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>{/* -> P42-Pool.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
            <SvgXml xml={SVG[19]} width={22} height={22} />
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Saturday evening</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>2 free · 1 until 9:00 PM · 2 not free</Text>
          </View>
          <SvgXml xml={SVG[20]} width={20} height={20} />
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 19 }}>Sitters set their own availability in their app. You only see free or busy, never where they are booked.</Text>
        <View style={{ flexDirection: "row", marginTop: "auto" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P45-PoolAsk.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Ask for Saturday evening</Text>
          </View>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
