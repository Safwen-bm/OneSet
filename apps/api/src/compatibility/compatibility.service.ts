import { Injectable } from '@nestjs/common';
import { evaluateCompatibility } from '@oneset/types';
import { PrismaService } from '../prisma/prisma.service';
import { CheckCompatibilityDto } from './dto/check-compatibility.dto';

@Injectable()
export class CompatibilityService {
  constructor(private readonly prisma: PrismaService) {}

  listRules() {
    return this.prisma.compatibilityRule.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async check(dto: CheckCompatibilityDto) {
    const [products, rules] = await Promise.all([
      this.prisma.product.findMany({
        where: { id: { in: dto.productIds } },
        include: { category: true, specifications: true },
      }),
      this.prisma.compatibilityRule.findMany({ where: { isActive: true } }),
    ]);

    const results: Array<{
      rule: string;
      message: string;
      severity: string;
      sourceProduct: { id: string; name: string };
      targetProduct: { id: string; name: string };
      sourceValue: string;
      targetValue: string;
      passed: boolean;
    }> = [];

    for (const rule of rules) {
      const sources = products.filter((product) => product.category.slug === rule.sourceCategory);
      const targets = products.filter((product) => product.category.slug === rule.targetCategory);

      for (const source of sources) {
        for (const target of targets) {
          if (source.id === target.id) continue;

          const sourceSpec = source.specifications.find((spec) => spec.label === rule.sourceSpec);
          const targetSpec = target.specifications.find((spec) => spec.label === rule.targetSpec);
          // Nothing to check this pair against — skip rather than guess.
          if (!sourceSpec || !targetSpec) continue;

          results.push({
            rule: rule.name,
            message: rule.message,
            severity: rule.severity,
            sourceProduct: { id: source.id, name: source.name },
            targetProduct: { id: target.id, name: target.name },
            sourceValue: sourceSpec.value,
            targetValue: targetSpec.value,
            passed: evaluateCompatibility(rule.operator, sourceSpec.value, targetSpec.value),
          });
        }
      }
    }

    const failed = results.filter((result) => !result.passed);
    const errorCount = failed.filter((result) => result.severity === 'error').length;
    const warningCount = failed.filter((result) => result.severity === 'warning').length;

    // One line per selected product: clean, or which rule(s) flagged it.
    const checklist = products.map((product) => {
      const issues = failed
        .filter((result) => result.sourceProduct.id === product.id || result.targetProduct.id === product.id)
        .map((result) => result.message);
      return {
        productId: product.id,
        productName: product.name,
        categoryName: product.category.name,
        ok: issues.length === 0,
        issues,
      };
    });

    return { results, errorCount, warningCount, ok: errorCount === 0, checklist };
  }
}
