// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import NprTitle from '~/components/NprTitle.vue'

describe('NprTitle', () => {
  it('renders the heading and NPR logo', async () => {
    const component = await mountSuspended(NprTitle)
    expect(component.text()).toContain('core are you?')
    expect(component.find('img').attributes('src')).toBe('/images/nprlogo.png')
  })
})
